function roleGenerator(format,chosenRole)
{
    let allRoles = []
    if(format==='Asian')
    {
        allRoles = ["Prime Minister","Deputy Prime Minister","Government Whip","Leader of Opposition","Deputy Leader of Opposition","Opposition Whip"]
    }
    else if(format==='British')
    {
        allRoles = ["Opening Government","Closing Government","Opening Opposition","Closing Opposition"]
    }

    let roles = [];
    for (let role in allRoles)
    {
        let roleObj = {};
        if(role===chosenRole)
        {
            roleObj.by  = 'user';
            roleObj.role = allRoles[role]
        }
        else
        {
            roleObj.by  = 'ai';
            roleObj.role = allRoles[role]
        }
        roles.push(roleObj)
    }
    return roles;
}

export {roleGenerator}