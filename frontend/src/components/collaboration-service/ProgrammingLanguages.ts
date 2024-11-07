type ProgrammingLanguage = {
    name: string,
    aceEditorModeName: string,
    JDoodleName: string,
}

const ProgrammingLanguages : ProgrammingLanguage[] = [
    {
        name: "Python",
        aceEditorModeName: "python",
        JDoodleName: "python3"
    },
    {
        name: "JavaScript",
        aceEditorModeName: "javascript",
        JDoodleName: "nodejs"
    },
    // {
    //     name: "C",
    //     aceEditorModeName: "c_cpp",
    //     JDoodleName: "c"
    // },
    // {
    //     name: "C++",
    //     aceEditorModeName: "c_cpp",
    //     JDoodleName: "cpp"
    // },
    // {
    //     name: "C#",
    //     aceEditorModeName: "csharp",
    //     JDoodleName: "csharp"
    // },
    // {
    //     name: "Golang",
    //     aceEditorModeName: "golang",
    //     JDoodleName: "go"
    // },
    // {
    //     name: "Java",
    //     aceEditorModeName: "java",
    //     JDoodleName: "java"
    // },
    // {
    //     name: "Lua",
    //     aceEditorModeName: "lua",
    //     JDoodleName: "lua"
    // },
    // {
    //     name: "TypeScript",
    //     aceEditorModeName: "typescript",
    //     JDoodleName: "typescript"
    // },
].sort((first, second) => first.name.localeCompare(second.name));

export { ProgrammingLanguages };
export type { ProgrammingLanguage };
