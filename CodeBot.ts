/* 
 * CodeBot for Discord
 * Author: Yahya Gedik
 * License: GNU GPU v3, see LICENSE
 * Github: https://github.com/jangofett4/CodeBot
 */
import { Client, Message } from 'discord.js';
import { logCatBot } from "./LoggerConfig"

const client = new Client();

var version = "1.0";

/**
 * Channel IDs to manage. Bot will listen to this text channels.
 */
var channelsToManage : string[] = [] /* Ex: ["123456789123456789", "123456789123456789", ...]; */;

/**
 * Language help list, auto generated in client.on('ready'), below
 */
var helpLangList : string = "";

client.on('ready', () => {
    logCatBot.info("Connected as " + client.user.id);

    // Generate help language list
    defs.forEach(lang => {
        helpLangList += `\t${lang.desc}\n\t\tCode: ${lang.name}\n`;
    });
});

// Queries messages
client.on('message', (msg) => {
    // Trim content of the message
    var content = msg.content.trim();

    // If help is requested, don't check if it is code, just help.
    if (content.startsWith("$help"))
    {
        // Delete '$help' message
        msg.delete(500);
        logCatBot.info(`Help requested by user [${msg.author.id}]`);
        msg.channel.send(`
        \`\`\`
CodeBot v${version}
Usage:
    Messages sent by users are tested with a filter.
    Message format is 'language_code code'.
    Files sent by users are not tested and always pass filter.
Valid Examples:
    Message: c++
        #include <cstdio>
        int main()
        {
            printf("Hello, World!");
            return 0;
        }

    Message: sql
        use db;
        select * from tbl where field = "value";

Defined Languages:
${helpLangList}

This is a open source project. For source: 
This message will destroy itself after 60 seconds.
        \`\`\``).then((m : Message) => { m.delete(60000); }); // Will delete itself after 60 seconds.
        return;
    }

    // If message is sent by this bot
    if (msg.author.id == client.user.id) return;

    // If message is sent from managed channels handle it
    if (channelsToManage.includes(msg.channel.id))
    {
        // If there is attachments (aka files) just let it thru
        if (msg.attachments.size > 0)
        {
            logCatBot.info(`File sent by user [${msg.author.id}] is allowed.`);
            return; // Allow files
        }

        // Check codeness factor of message
        // Highly inefecctive, but can't see any other way of doing it...
        var result = codeness(msg.content);

        switch (result.Result)
        {
            case ResultType.NotDefined:
                msg.channel.send("Language code of message sent is invalid. For help, type '$help'!").then((m : Message) => { m.delete(10000); });
                msg.delete(500);
                break;
            case ResultType.NotEnough:
                msg.channel.send(`Message is invalid for ${result.Lang.name} language. For help, type '$help'!`).then((m : Message) => { m.delete(10000); });
                msg.delete(500);
                break;
            case ResultType.Ok:
                var content = "";
                content = "```" + result.Lang.name + "\n" + result.Content.replace("`", "\`");
                if (result.Lang.commentLine != "")
                {
                    content += "\n\n" + result.Lang.commentLine + ` Sent by ${msg.author.username} [${msg.author.id}].\`\`\``;
                    msg.channel.send(content);
                }
                else
                {
                    content += "```";
                    msg.channel.send(`${result.Lang.name} code sent by ${msg.author.username} [${msg.author.id}]:`);
                    msg.channel.send(content);
                }
                msg.delete(500);
                break;
            default:
                break;
        }
        return;
    }
});

/**
 * Defines a basic language structure for easier filtering
 */
class LangDef {
    name : string;
    elements : string[];
    extension : string;
    desc : string;
    commentLine : string;

    constructor(name : string,  elems : string[] = [], ext : string = "", desc : string = "", comment : string = "")
    {
        this.name = name;
        this.set(elems);
        this.extension = ext;
        this.desc = desc;
        this.commentLine = comment;
    }

    set(elm : string[]) : void
    {
        this.elements = elm;
    }

    add(e : string) : void
    {
        this.elements.push(e);
    }

    clear() : void
    {
        this.elements = [];
    }

    check(s : string, limit : number = -1) : number
    {
        var total = 0;
        for (var i = 0; i < this.elements.length; i++)
        {
            if (s.includes(this.elements[i])) total++;
            if (total == limit)
                break;
        }
        return total;
    }
}

/**
 * Predefined languages. Common phrases of a language is needed for filter.
 * Description is needed for help command.
 * Extension is not needed but will be used in next versions.
 * Comment line prefix is needed for author comment. If not provided bot will fallback to normal message.
 */
const defs : LangDef[] = [
    new LangDef("cpp", ["include", "int", "void", "string", "char", "return", "for", "while", "if", "else", "switch", "const", "print", "class", "struct", "public", "private", "static", "[", "]", "*", "(", ")"], "cpp", "C++ - General purpose object oriented language", "//"),
    new LangDef("sql", ["select", "insert", "alter", "update", "database", "where", "from", "*", "use", "values", "view", "as", "table", "not", "in", "=", "if", "exists", "(", ")", "add", "column", "set"], "sql", "SQL - A language used for managing and designing data structures and databases", "#"),
    new LangDef("cs",  ["using", "int", "void", "main", "string", "char", "return", "for", "while", "if", "else", "switch", "do", "const", "class", "public", "private", "static", "var", "static", "this", "[", "]", "(", ")", "$"], "cs", "C# - A general purpose object oriented programming language that uses .NET framework", "//"),
    new LangDef("js",  ["function", "console", "log", "return", "require", "const", "for", "while", "if", "else", "switch", "use", "strict", "this", "var", "let", "[", "]", "(", ")"], "js", "JavaScript - A client side programming language used for both desktop and web development", "//"),
];

/**
 * Extracts language code from a full message.
 * @param s Full message content. Must be trimmed before calling this function.
 */
function extract_lang(s : string) : string[]
{
    var lang = "";
    
    var i = 0;
    var c = s[i];

    while (!isWhite(c = s[i++]) && i < s.length)
        lang += c;
    return [lang.toLowerCase(), s.substr(i)];
}

/**
 * White characters used for recognition of language code, extract_lang(string)
 */
const whiteChars : string[] = [" ", "\n", "\r", "\t", "\0"];

/**
 * Uses whiteChars[] to check if a string/character is white space
 * @param c Character/String to check if it is white space
 */
function isWhite(c : string) : boolean
{
    return whiteChars.includes(c);
}

/**
 * Result of codeness(string) method. 
 * Contains recognized language, content and result type.
 */
class CodenessResult
{
    Lang : LangDef;
    Content : string;
    Result : ResultType;

    constructor(r : ResultType, l : LangDef = null, c : string = "")
    {
        this.Lang = l;
        this.Result = r;
        this.Content = c;
    }
}

/**
 * Result type used for CodenessResult.
 */
enum ResultType
{
    Ok, NotDefined, NotEnough
}

/**
 * Main 'codeness' checker function. Pretty ineffective.
 * 
 */
function codeness(s : string) : CodenessResult
{
    // Returned value contains both language_code (0) and content without language_code (1)
    var langstr = extract_lang(s);
    logCatBot.info(`Requested code for language: ${langstr[0]}`);

    var lang : LangDef;
    for (var i = 0; i < defs.length; i++)
    {
        if (defs[i].name == langstr[0])
        {
            lang = defs[i];
            break;
        }
    }

    // No language is found for given language_code
    if (lang == null)
    {
        logCatBot.info("Requested language is not defined");
        return new CodenessResult(ResultType.NotDefined);
    }

    // Language is checked with general language items from LangDef.
    // Limited to 3 for better performance (if there is any performance...);
    var result = lang.check(langstr[1], 3);
    if (result < 3)
    {
        logCatBot.info("Requested code is not 'code enough' to be displayed");
        return new CodenessResult(ResultType.NotEnough, lang);
    }

    // Message is a valid code. Return it
    return new CodenessResult(ResultType.Ok, lang, langstr[1]);
}

client.login("bot_client_id_here");