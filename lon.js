// ==UserScript==
// @name         Light on Novels
// @version      0.1.0
// @description  Add colors to novels
// @author       dcdotjs
// @match        https://www.lightnovelworld.com/novel/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lightnovelworld.com
// @grant        GM_addStyle
// ==/UserScript==

const BEFORE_CHARS = [' ', '>'];
const AFTER_CHARS = [' ', '<', ',', '—', '.', '!', '?'];

const DIALOG_COLOR = '#ff8c00';
const SYSTEM_COLOR = '#4169e1';
const THOUGHT_COLOR = '#ff00ff';
const ERROR_COLOR = '#ff0000';

GM_addStyle(`
#chapter-container p {
    margin-bottom: 5em !important;
}
`);

const chapter = document.querySelector('#chapter-container');
let content = chapter.innerHTML;

content = content
    .replace(/<script.+?<\/script>/gs, '')
    .replace(/<ins.+?<\/ins>/gs, '');

content = content
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .replaceAll('‘', '\'')
    .replaceAll('’', '\'');

chapter.innerHTML = content;
damageControl();
highlightText('"', '"', DIALOG_COLOR);
highlightText('[', ']', SYSTEM_COLOR, true);
highlightText('\'', '\'', THOUGHT_COLOR);
chapter.innerHTML = content;

function highlightText(startChar, endChar, color, fullColor) {
    const texts = [];

    for (let i = 0; i < content.length; i++) {
        if (content[i] === startChar && BEFORE_CHARS.includes(content[i - 1])) {
            let skip = 0;

            for (let y = i + 1; y < content.length; y++) {
                if (content[y] === endChar && AFTER_CHARS.includes(content[y + 1])) {
                    if (skip > 0) {
                        skip--;
                        continue;
                    }

                    texts.push(content.substring(i + 1, y));
                    i = y;
                    break;
                }

                if (content[y] === startChar && BEFORE_CHARS.includes(content[y - 1])) {
                    skip++;
                }
            }
        }
    }

    for (const text of texts) {
        const replacement = fullColor ?
            `<b style="color: ${color};">${startChar}${text.replaceAll('\'', '&#39;')}${endChar}</b>` :
            `${startChar}<b style="color: ${color};">${text.replaceAll('\'', '&#39;')}</b>${endChar}`;

        content = content.replace(`${startChar}${text}${endChar}`, replacement);
    }
}

function damageControl() {
    const paragraphs = chapter.querySelectorAll('p');

    for (let i = 0; i < paragraphs.length; i++) {
        if (paragraphs[i].innerHTML.includes('"') && (paragraphs[i].innerHTML.match(/"/g) || []).length % 2 !== 0) {
            for (let y = i + 1; y < paragraphs.length; y++) {
                if (paragraphs[y].innerHTML.includes('"')) {
                    if ((paragraphs[y].innerHTML.match(/"/g) || []).length % 2 === 0) {
                        isolateParagraph(i);
                    }

                    i = y;
                    break;
                }
            }
        }
    }
}

function isolateParagraph(index) {
    const paragraphs = chapter.querySelectorAll('p');
    const paragraph = paragraphs[index];
    content = content.replace(`>${paragraph.innerHTML}<`, `><b style="color: ${ERROR_COLOR};">!!!</b> ${paragraph.innerHTML.replaceAll('"', '&#34;')} <b style="color: ${ERROR_COLOR};">!!!</b><`);
}