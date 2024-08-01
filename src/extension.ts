import * as vscode from 'vscode';
import { OpenAI } from 'openai';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension "Sustainability Extension" is active');

    let disposable = vscode.commands.registerCommand('sustainabilityextention.SustainabilityCheck', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const code = editor.document.getText(selection);

            try {
                const result = await analyzeCodeWithOpenAI(code);
                await displayResultInNewTab(result ? result : 'No result');
            } catch (error) {
                vscode.window.showErrorMessage('Failed to analyze code: ' + error);
            }
        } else {
            vscode.window.showErrorMessage('No active editor detected.');
        }
    });

    context.subscriptions.push(disposable);
}

const prompt = `
instructions:
* understand how the code works, identify the language, algorithm, inputs and outputs.
* find the time and memory complexity of the code and return in the time & complexity slot.
* check the code against Adherence to Coding Standards and Best Practices. provide a scale from 1 to 5, where 5 is adherence to coding standards and 1 is not adherence to coding standards at all.
* calculate the Cyclomatic Complexity of the code and provide it in the Cyclomatic Complexity slot.
* Calculate the Halstead Ratio of the code and provide it in the Halstead Complexity slot provide ratio as well.
* if there are any syntax errors in the code, please provide them in the syntax errors slot.
* if there are any code smells in the code, please provide them in the code smells slot.
* if there are any potential bugs in the code, please provide them in the potential bugs slot.
* if the codes readability can be improved, please provide suggestions in the improvement suggestions slot.
* if the code time and complexity can be improved, provide the differences in efficiency boost slot.
* if the code is as efficient as possible and can't be improved, please write "no improvements needed" in the improvement suggestions slot.
Return:
1. language, algorithm, inputs, outputs:
2: Cyclomatic Complexity:
3. Halstead Complexity:
4. Time & Space Complexity:
5. Syntax Errors:
6. Code Smells:
7. Potential Bugs:
8. Improvement Suggestions:
9. Efficiency Boost:
Code:
`;

async function analyzeCodeWithOpenAI(code: String) {
	const openai = new OpenAI({
        apiKey: ''  // Replace with your actual API key
    });
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: `${prompt}\n${code}` }],
            model: "gpt-4o-mini",
          });
		const resultText = completion.choices[0].message.content;
        return resultText;
    } catch (error) {
        console.error('Failed to analyze code with OpenAI:', error);
        throw error;
    }
}
async function displayResultInNewTab(result: string) {
    const document = await vscode.workspace.openTextDocument({ content: result, language: 'markdown' });
    await vscode.window.showTextDocument(document);
}
// This method is called when your extension is deactivated
export function deactivate() {}
