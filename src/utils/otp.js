export const generateOtp = ()=>
{
    const numbers = ['1','2','3','4','5','6','7','8','9','0'];
    let otp = ''
    for(let i=0;i<6;i++)
    {
        otp+=numbers[Math.floor(Math.random()*numbers.length)]
    }
    return otp;
}