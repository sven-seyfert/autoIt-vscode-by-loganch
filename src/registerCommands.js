import { commands } from 'vscode';
import * as aiCommands from './ai_commands';
import { commandsList, commandsPrefix } from './commandsList';

export const registerCommands = ctx => {
  const aiCommandsMap = new Map(Object.entries(aiCommands));

  for (const command of commandsList) {
    const commandFunc = aiCommandsMap.get(command);
    if (typeof commandFunc === 'function') {
      ctx.subscriptions.push(
        commands.registerCommand(commandsPrefix + command, commandFunc)
      );
    }
  }
};