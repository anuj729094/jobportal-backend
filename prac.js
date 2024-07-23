let arr =[
    {
        id:1,
        skill:"react js"
    },
    {
        id:2,
        skill:"node js"
    }
]

console.log(arr.find((item)=>item.skill.toLocaleLowerCase()==="react"))