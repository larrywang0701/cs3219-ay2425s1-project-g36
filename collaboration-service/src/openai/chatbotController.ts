import OpenAI from "openai";

/**
 * Implementation of an AI chatbot as a controller to allow users to seek for help
 * within the PeerPrep interface.
 */

type OpenAIMessage = {
    role: "system" | "user" | "assistant";
    content: string;
}

const SYSTEM_PROMPT_HEADER = "You are a chatbot that assists users in solving programming questions. You should try to guide the user towards a correct approach for the programming question. You should encourage users to figure out the solution on their own.\n\nThe question is given as follows:\n\n\"\"\"\n";
const SYSTEM_PROMPT_FOOTER = "\n\"\"\"";

const openai = new OpenAI({
    organization: "org-Wcpy1udnGTX4YT8aUneK2g1F",
    project: "peerprep",
}); 

function makeSystemPrompt(question : string) {
    return SYSTEM_PROMPT_HEADER + question + SYSTEM_PROMPT_FOOTER;
}

async function makeReply(question : string, messages : OpenAIMessage[]) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: makeSystemPrompt(question) },
            ...messages
        ]
    });
    console.log("Prompt tokens used:", completion.usage?.prompt_tokens);
    console.log("Completion tokens used:", completion.usage?.completion_tokens);
    console.log("Total tokens used:", completion.usage?.total_tokens);
    return completion.choices[0].message;
}