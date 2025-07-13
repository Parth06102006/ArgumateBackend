function roleGenerator(format,chosenRole)
{
    let allRoles = []
    if(format==='asian')
    {
        allRoles = ["Prime Minister","Leader of Opposition","Deputy Prime Minister","Deputy Leader of Opposition","Government Whip","Opposition Whip"]
    } 
    else if(format==='british')
    {
        allRoles = [
          "Prime Minister",
          "Deputy Prime Minister",
          "Leader of Opposition",
          "Deputy Leader of Opposition",
          "Member of Government",
          "Government Whip",
          "Member of Opposition",
          "Opposition Whip",
        ]
    }

    let roles = [];
    for (let role in allRoles)
    {
        let roleObj = {};
        if(allRoles[role]===chosenRole)
        {
            roleObj.by  = 'user';
            roleObj.role = allRoles[role]
        }
        else
        {
            roleObj.by  = 'ai';
            roleObj.role = allRoles[role]
        }
        console.log(roles)
        roles.push(roleObj)
    }
    return roles;
}

export {roleGenerator}