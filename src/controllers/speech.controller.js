import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Debate} from "../models/debate.model.js";
import {Speech} from "../models/speech.model.js"
import { io } from "../server.js";
import axios from "axios";
import fs from 'fs-extra'
import {GoogleGenAI} from '@google/genai'

const createSpeech = asyncHandler(async(req,res)=>
{
    const userId = req.user;
    const debateId = req.params.id;
    let {content,role,by} = req.body;

    const existingDebate = await Debate.findById(debateId);
    if(!existingDebate)
    {
        throw new ApiError(400,'No Debate exisits')
    }
    const debateRoles = existingDebate.roles;
    if(by==='user')
    {
      for (let i in debateRoles)
      {
        if((debateRoles[i].by === 'user')&&(debateRoles[i].role !== role))
        {
          throw new ApiError(401,'Seleted Role of User does not match the role being accessed')
        }
      }
    }
    const roomId = existingDebate.roomId
    console.log(userId)
    console.log(debateId)
    if(!role||!by)
    {
        throw new ApiError(403,'Details are missing')
    }
    let speech = await Speech.findOne({user:userId,debate:debateId});
    console.log(speech)
    if(by==='ai')
    {
    try {
    const motion = existingDebate.topic;
    console.log(motion)
    if(!motion)
    {
      throw new ApiError(400,'Motion Not Found')
    }

    const isOpposition = ["Leader of Opposition", "Deputy Leader of Opposition", "Opposition Whip", "Opening Opposition", "Closing Opposition"].includes(role);
    let stance = '';
    isOpposition ? stance='opposing' : stance = 'supporting'
    const format = existingDebate.format;
    
    let prompt = ''
    if (!speech || speech.speeches.length === 0) {
      prompt = `
        You are an AI participating in a ${format} Parliamentary Debate.

        Debate Motion: "${motion}"
        Your Role: ${role} (${stance} the motion)

        Instructions:
        You are the first speaker from your side. Write a 60–80 word opening speech.
        - Clearly state your stance (${stance} the motion)
        - Define important terms if needed
        - Introduce your team's core arguments
        - Set a confident, formal tone appropriate for your role (${role})
        - End with a strategic preview of what your team will prove
      `;
      console.log(prompt)
    }
    else
    {
      const prevIsOpposition = ["Leader of Opposition", "Deputy Leader of Opposition", "Opposition Whip", "Opening Opposition", "Closing Opposition"].includes(prevRole);
      const lastResponse = speech.speeches.at(-1)
      const prevRole = lastResponse.role;
      const prevMessage = lastResponse.content
      const sameSide = isOpposition === prevIsOpposition;
      
      if(sameSide)
      {
        prompt = `
          You are an AI participating in a ${format} Parliamentary Debate.
  
          Debate Motion: "${motion}"
          Your Role: ${role} (${stance} the motion)
  
          Previous Speaker: ${prevRole}
          Their Argument: "${prevMessage}"
  
          Instructions:
          You are on the same side as the previous speaker. Build upon and extend their argument in a persuasive 50-word speech.
          - Deepen the logic or add a new dimension.
          - Reinforce your side’s stance (${stance} the motion).
          - Maintain the tone and strategy of your role (${role}).
          - End with an impactful call or thought.
          `;
  
      }
      else
      {
        prompt = `
            You are an AI participating in a ${format} Parliamentary Debate.
  
            Debate Motion: "${motion}"
            Your Role: ${role} (${stance} the motion)
  
            Previous Speaker: ${prevRole}
            Their Argument: "${prevMessage}"
  
            Instructions:
            Respond to the previous speaker from the opposite bench. Write a persuasive, 50-word rebuttal speech.
            - Refute key claims.
            - Present your side's perspective (${stance} the motion).
            - Stay formal, sharp, and role-specific.
            - End with a strong closing line or rhetorical question.`;
      }
    }
    console.log(prompt)
    const client = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
    const response = await client.models.generateContent({
      model:'gemini-2.5-flash',
      contents:prompt
    })
    console.log(response.text)
    content = response.text
  }
  catch(error)
  {
    throw new ApiError(400,'Cannot generate Content')
  }
}
   if(!speech)
    {
        speech = await Speech.create({user:userId,debate:debateId,speeches:[{by,role,content}]})
    }
    else
    {
        speech.speeches.push({by,role,content});
        await speech.save()
    }

    io.to(roomId).emit('new_speech',
        {
            by,
            role,
            content
        });

    return res.status(200).json(new ApiResponse(200,'Speech Created Successfully',speech))
})

const createPoiQues = asyncHandler(async(req,res)=>
{
    const userId = req.user;
    const debateId = req.params.id;
    let {question,roleFrom,roleTo}= req.body;

    const existingDebate = await Debate.findById(debateId);
    if(!existingDebate)
    {
        throw new ApiError(400,'No Debate exisits')
    }

    const roomId = existingDebate.roomId
    if([question,roleFrom,roleTo].some(t=>t.trim()===''))
    {
        throw new ApiError(403,'Details are missing')
    }

    let speech = await Speech.findOne({user:userId,debate:debateId});

    if(!speech)
    {
        throw new ApiError(400,'No Speech Found')
    }
    const debateRoles = existingDebate.roles;
    let sender = '';
    let receiver = ''
    for (let i in debateRoles)
      {
        if((debateRoles[i].role === roleFrom))
        {
          sender = debateRoles[i].by
        }
        else if((debateRoles[i].role === roleTo))
        {
          receiver = debateRoles[i].by
        }
    }
    console.log('Sender',sender)
    console.log('Reciever',receiver)
    if(!sender || !receiver)
    {
      throw new ApiError(400,'Sender and Receiver : Not Found')
    }

    //api to call ai to generate the poi
      if(sender==='ai')
        {
          try {
          const motion = existingDebate.topic;
          const roleToLastResponse = speech.speeches.filter(t=>t.role === roleTo).at(-1)
          const format = existingDebate.format;
          if(!motion)
          {
            throw new ApiError(400,'Motion Not Found')
          }
              const prompt = `
              You are participating in a ${format} Parliamentary Debate.

              Debate Motion: "${motion}"

              You are the ${roleFrom} (${sender}) and want to raise a Point of Information (POI) directed at ${roleTo} (${receiver}), who just made the following argument:

              "${roleToLastResponse?.content}"

              Instructions:
              Write a short, sharp POI (1–2 sentences max). Your question should either:
              - Challenge a contradiction or flaw in the above argument,
              - Seek clarification that puts pressure on their position,
              - Or force them to defend an uncomfortable consequence.

              Maintain the tone and strategy expected from a formal debate.
              Do not include filler words like “May I ask a POI?” — get straight to the point.
              `;
          console.log(prompt)
          const client = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
          const response = await client.models.generateContent({
            model:'gemini-2.5-flash',
            contents:prompt
          })
          console.log(response.text)
          question = response.text
      }
      catch(error)
      {
        throw new ApiError(400,'Unable to generate POI Question')
      }
    }
    let from = {by:sender,role:roleFrom}
    let to = {by:receiver,role:roleTo}

    speech.pois.push({from,to,question})
    await speech.save()

    return res.status(200).json(new ApiResponse(200,'POI Created Successfully',speech))
})

const createPoiAns = asyncHandler(async(req,res)=>
{
    const userId = req.user;
    const debateId = req.params.id;
    let {answer,roleFrom,roleTo}= req.body;

    const existingDebate = await Debate.findById(debateId);
    if(!existingDebate)
    {
        throw new ApiError(400,'No Debate exisits')
    }

    const roomId = existingDebate.roomId

    if([answer,roleFrom,roleTo].some(t=>t.trim()===''))
    {
        throw new ApiError(403,'Details are missing')
    }

    let speech = await Speech.findOne({user:userId,debate:debateId});

    if(!speech)
    {
        throw new ApiError(400,'No Speech Found')
    }
    const debateRoles = existingDebate.roles;
    let sender = '';
    let receiver = ''
    for (let i in debateRoles)
      {
        if((debateRoles[i].role === roleFrom))
        {
          sender = debateRoles[i].by
        }
        else if((debateRoles[i].role === roleTo))
        {
          receiver = debateRoles[i].by
        }
    }
    console.log('Sender',sender)
    console.log('Reciever',receiver)
    if(!sender || !receiver)
    {
      throw new ApiError(400,'Sender and Receiver : Not Found')
    }

    let from = {by:sender,role:roleFrom}
    let to = {by:receiver,role:roleTo}
    console.log('Trying to find POI with:');
    console.log('From:', sender, roleFrom);
    console.log('To:', receiver, roleTo);

    let poi = speech?.pois?.find(p =>
        p.from.by === receiver &&
        p.from.role === roleTo &&
        p.to.by === sender &&
        p.to.role === roleFrom &&
        !p.answered
      );

    if(!poi)
    {
        throw new ApiError(404,'No Poi Found')
    }
    console.log(poi)
    if(sender==='ai')
        {
          try {
            const motion = existingDebate.topic;
            const format = existingDebate.format;
            if(!motion)
              {
                throw new ApiError(400,'Motion Not Found')
              }
              const toAnswer = ["Leader of Opposition", "Deputy Leader of Opposition", "Opposition Whip", "Opening Opposition", "Closing Opposition"].includes(roleFrom);
              const byQuestion = ["Leader of Opposition", "Deputy Leader of Opposition", "Opposition Whip", "Opening Opposition", "Closing Opposition"].includes(roleTo);
              let stance = '';
              toAnswer && byQuestion ? stance = 'supporting' : stance = 'opposing';
              const prompt = `
              You are an AI debater participating in a ${format} Parliamentary Debate.

              Debate Motion: "${motion}"
              Your Role: ${roleFrom} (${stance} the motion)

              You were asked the following Point of Information (POI) by ${roleTo}:
              "${poi.question}"

              Instructions:
              Write a short, sharp, and strategic response to this POI (2–3 sentences only).
              - Defend your position (${stance} the motion).
              - Directly counter or expose a flaw in the POI.
              - Maintain formal and confident tone fitting your role (${roleFrom}).
              - If helpful, turn the POI back on the opponent.

              End with a memorable or impactful line that reinforces your team's argument.
              `;
              
          console.log(prompt)
          const client = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
          const response = await client.models.generateContent({
            model:'gemini-2.5-flash',
            contents:prompt
          })
          console.log(response.text)
          answer = response.text
      }
      catch(error)
      {
        console.error(error)
        throw new ApiError(400,'Unable to generate POI Answer')
      }
    }

    poi.answer = answer
    poi.answered = true

    await speech.save()


    io.to(roomId).emit('new_poi_ans',
        {
            from,
            to,
            answer,
        });

    return res.status(200).json(new ApiResponse(200,'POI Answered Successfully',speech))
}) 

const voiceToText = asyncHandler(async (req, res) => {
  try {
    const filePath = req.file.path;
    const apiKey = process.env.SPEECH_TO_TEXT_API_KEY;

    // 1. Upload the audio to AssemblyAI
    const uploadResponse = await axios({
      method: "post",
      url: "https://api.assemblyai.com/v2/upload",
      headers: {
        authorization: apiKey,
        "Transfer-Encoding": "chunked", // required
      },
      data: fs.createReadStream(filePath),
    });

    const audioUrl = uploadResponse.data.upload_url;
    console.log("Audio uploaded:", audioUrl);

    // 2. Send for transcription
    const response = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: audioUrl,
        speech_model: "universal",
      },
      {
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response)
    const transcriptId = response.data.id;
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;

    // 3. Poll until complete
    while (true) {
      const pollingRes = await axios.get(pollingEndpoint, {
        headers: { authorization: apiKey },
      });

      if (pollingRes.data.status === "completed") {
        fs.unlinkSync(filePath); // delete temp file
        return res.status(200).json({ transcription: pollingRes.data.text });
      } else if (pollingRes.data.status === "error") {
        throw new Error("Transcription failed: " + pollingRes.data.error);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s
      }
    }
  } catch (err) {
    console.error("Transcription error:", err.message);
    return res.status(500).json({ error: "Failed to transcribe audio." });
  }
});

const sentimentalAnalysis = asyncHandler(async(req,res)=>{
  const {data} = req.body;
  console.log(data)
  const response = await fetch(
		"https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english",
		{
			headers: {
				Authorization: `Bearer ${process.env.HF_TOKEN}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({ inputs: data }),
		}
	);
	const result = await response.json();
  console.log(result)
  let emotion = ''
  if (Array.isArray(result) && result[0]?.[0]?.label) {
    const label1 = result[0][0].label;
    const score1 = result[0][0].score;
    const label2 = result[0][1]?.label || '';
    const score2 = result[0][1]?.score || 0;

    if (label1 === 'NEGATIVE' && score1 > score2) {
      emotion = 'NEGATIVE';
    } else {
      emotion = 'POSITIVE';
    }
  } else {
    emotion = 'UNKNOWN';
  }
	return res.json(new ApiResponse(200,'Sentimental Analysis Completed',{result:emotion}));
})

const topicClassifcation = asyncHandler(async(req,res)=>
{
    const userId = req.user;
    const debateId = req.params.id;

    const existingDebate = await Debate.findById(debateId);
    if(!existingDebate)
    {
        throw new ApiError(400,'No Debate exisits')
    }

    let speech = await Speech.findOne({user:userId,debate:debateId});
    let topic='';
    const latestSpeech = speech.speeches.at(-1)?.content;
    if(!latestSpeech)
      {
        throw new ApiError(404,'User speech is not present')
      }
    // Step 1: POST to get the hash (job ID)
     
    try {
      const postResponse = await axios.post(
        "https://piyush2205-topic-classification.hf.space/gradio_api/call/predict",
        {
          data: [latestSpeech],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      const hash = await postResponse.data['event_id'];
      console.log("🆔 Job Hash:", hash);
  
      // Step 2: Poll GET to get result
      const getUrl = `https://piyush2205-topic-classification.hf.space/gradio_api/call/predict/${hash}`;
      const getResponse = await axios.get(getUrl);
      console.log("✅ Prediction:", getResponse.data);
      const text = getResponse.data 
      console.log(text)
      const match = text.match(/Topic:\s*(.+?)\s*\(Confidence:/);
      console.log(match)
      if (match && match[1]) {
        topic = match[1]; // "technology"
        return res.status(200).json(new ApiResponse(200,'Topic Classification Successfull',{topic}))
      } else {
        throw new ApiError(400,'Topic Cannot be found')
      }
    } catch (error) {
      throw new ApiError(400,'Topic Classification Unsuccessfull')
    }
})

export {createSpeech,createPoiQues,createPoiAns,voiceToText,sentimentalAnalysis,topicClassifcation};