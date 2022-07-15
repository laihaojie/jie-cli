export default () => {
  return {
    type: 'rawlist',
    message: 'What project do you need ?',
    name: 'project',
    choices: [{
      name: 'Vue3',
    },
    {
      name: 'Vue2',
    },
    {
      name: 'Koa',
    },
    {
      name: 'Html',
    },
    {
      name: 'React',
    },
    ],
  }
}

// export default () => {
//     return {
//         type: "input",
//         name: "packageName",
//         message: "set package name",
//         validate(val) {
//             if (val) return true;
//             return "Please enter package name";
//         },
//     };
// };

// export default () => {
//     return {
//         type: "input",
//         name: "port",
//         message: "set server port number",
//         default () {
//             return 8000;
//         },
//     };
// };
