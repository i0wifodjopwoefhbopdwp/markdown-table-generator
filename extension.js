const vscode = require('vscode');

/**
 * Формирует таблицу Markdown по заголовкам и числу строк.
 */
function createTable(headers, rowCount) {
    const lines = [];

    lines.push('| ' + headers.join(' | ') + ' |');
    lines.push('| ' + headers.map(() => '---').join(' | ') + ' |');

    for (let i = 0; i < rowCount; i++) {
        lines.push('| ' + headers.map(() => '').join(' | ') + ' |');
    }

    return lines.join('\n') + '\n';
}

/**
 * Регистрирует команду создания таблицы при активации расширения.
 */
function activate(context) {
    const command = vscode.commands.registerCommand(
        'markdownTable.generate',
        async () => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage('Сначала откройте файл.');
                return;
            }

            const columnInput = await vscode.window.showInputBox({
                prompt: 'Введите названия столбцов через запятую',
                placeHolder: 'Название, Описание, Пример',
                validateInput: (value) => {
                    const headers = value.split(',').map(s => s.trim());

                    if (headers.some(header => header.length === 0)) {
                        return 'Название каждого столбца должно быть заполнено.';
                    }

                    if (value.includes('|')) {
                        return 'Названия не должны содержать символ |.';
                    }

                    return undefined;
                }
            });

            if (columnInput === undefined) {
                return;
            }

            const rowInput = await vscode.window.showInputBox({
                prompt: 'Введите количество пустых строк от 1 до 100',
                placeHolder: '3',
                validateInput: (value) => {
                    if (!/^[0-9]+$/.test(value)) {
                        return 'Введите целое положительное число.';
                    }

                    const count = Number(value);

                    if (count < 1 || count > 100) {
                        return 'Количество строк должно быть от 1 до 100.';
                    }

                    return undefined;
                }
            });

            if (rowInput === undefined) {
                return;
            }

            const headers = columnInput.split(',').map(s => s.trim());
            const table = createTable(headers, Number(rowInput));

            const inserted = await editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, table);
            });

            if (!inserted) {
                vscode.window.showErrorMessage('Не удалось вставить таблицу.');
            }
        }
    );

    context.subscriptions.push(command);
}

module.exports = { activate };