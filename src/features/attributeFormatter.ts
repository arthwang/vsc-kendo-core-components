import { DocumentFormattingEditProvider, TextEdit, TextDocument, Range, FormattingOptions } from 'vscode';
import * as os from 'os';
export default class AttributeFormatter
  implements DocumentFormattingEditProvider {
  constructor() { }
  public provideDocumentFormattingEdits(doc: TextDocument, options: FormattingOptions): TextEdit[] {
    const textEdits: TextEdit[] = [];

    const kendosRe = /(<km?-[\w-]+)((\s+[\w-]+(=(\w+|'[^']+'|"[^"]+"))?)+)/gm
    const attrRe = /\s+[\w-]+(=(\w+|'[^']+'|"[^"]+"))?/gm;
    const text = doc.getText().toString();
    let kMatch: RegExpExecArray = null;
    while ((kMatch = kendosRe.exec(text)) !== null) {
      let str = '';
      const alignCol = doc.positionAt(kMatch.index + kMatch[1].length).character + 1;
      let aMatch: RegExpExecArray = null;
      const startPos = doc.positionAt(kMatch.index + kMatch[1].length + 1);
      const endPos = doc.positionAt(kMatch.index + kMatch[0].length);
      while ((aMatch = attrRe.exec(kMatch[2])) !== null) {
        let indents = 0;
        const attrLines = aMatch[0].trim().split(new RegExp(`${os.EOL}+`)).map(line => line.trim());
        for (let i = 0; i < attrLines.length; i++) {
          if (/^\s*[\)\]\}]/.test(attrLines[i])) {
            indents--;
          }
          if (aMatch.index === 0 && i === 0) {
            str += attrLines[0];
          } else {
            let spcNum = alignCol + options.tabSize * indents;
            if (!/^[\w-]+(=|$)/.test(attrLines[i])) {
              spcNum += 4;
            }
            str += ' '.repeat(spcNum) + attrLines[i];
            if (/[\(\[\{]\s*$/.test(attrLines[i])) {
              indents++;
            }
          }
          str += os.EOL;
        }
      }
      textEdits.push(TextEdit.replace(new Range(startPos, endPos), str.trim()));
    }
    return textEdits;
  }
}