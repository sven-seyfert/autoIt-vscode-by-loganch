import { languages, TextEdit, Range, Position, window, workspace, Uri } from 'vscode';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import conf from './ai_config';

const AutoItFormatterProvider = {
    provideDocumentFormattingEdits: async (document) => {
        const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            window.showErrorMessage('No workspace folder open');
            return [];
        }

        const tempFile = path.join(workspaceFolder, `temp_format_${Date.now()}.au3`);
        const backupDir = path.join(workspaceFolder, 'Backup'); // Define backup directory

        try {
            // Write document content to temp file
            await workspace.fs.writeFile(Uri.file(tempFile), Buffer.from(document.getText()));

            // Run Tidy on temp file
            await runTidy(tempFile);

            // Read formatted content
            const formattedContent = await workspace.fs.readFile(Uri.file(tempFile));
            return [TextEdit.replace(fullDocumentRange(document), formattedContent.toString())];
        } catch (error) {
            window.showErrorMessage(`AutoIt Formatting Error: ${error.message}`);
            return [];
        } finally {
            // Clean up temp file
            try { fs.unlinkSync(tempFile); } catch { }

            // NEW: Clean up backup file
            try {
                // Construct backup file name (temp_format_123456789_old1.au3)
                const backupFile = path.join(
                    backupDir,
                    path.basename(tempFile, '.au3') + '_old1.au3'
                );

                if (fs.existsSync(backupFile)) {
                    fs.unlinkSync(backupFile);
                }
            } catch (error) {
                // Silent fail - backup might not exist
            }
        }
    }
};

export const formatterProvider = languages.registerDocumentFormattingEditProvider('autoit', AutoItFormatterProvider);

/**
 * Run AutoIt3Wrapper Tidy command
 */
async function runTidy(filePath) {
    return new Promise((resolve, reject) => {
        const tidyProcess = spawn(conf.config.aiPath, [
            conf.config.wrapperPath,
            '/Tidy',
            '/in',
            filePath
        ]);

        // Handle process exit
        tidyProcess.on('exit', code => {
            if (code === 0) resolve();
            else reject(new Error(`Tidy exited with code ${code}`));
        });

        // Handle process errors
        tidyProcess.on('error', reject);

        // Add timeout (5 seconds)
        const timeout = setTimeout(() => {
            if (tidyProcess.exitCode === null) {
                tidyProcess.kill();
                reject(new Error('Tidy process timed out'));
            }
        }, 5000);

        // Clear timeout when process exits
        tidyProcess.on('exit', () => clearTimeout(timeout));
    });
}

/**
 * Create a range covering the entire document
 */
function fullDocumentRange(document) {
    const lastLine = document.lineAt(document.lineCount - 1);
    return new Range(
        new Position(0, 0),
        new Position(document.lineCount - 1, lastLine.text.length)
    );
}