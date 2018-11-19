const Fs = require("fs");
const Util = require("util");
const Chalk = require("chalk");
const Inquirer = require("inquirer");

const { AbsPath, ReadFile, ReadFolder, TrimSpace } = require("./index");
const { NEW_TEXT } = require("../i18n");

module.exports = async function() {
	const question = [{
		default: "demo",
		message: NEW_TEXT.qaName,
		name: "name",
		type: "input",
		validate: val => {
			const regexp = /^[0-9a-z-_]*$/g;
			if (!regexp.test(val)) {
				return Chalk.redBright(NEW_TEXT.judgeName);
			} else if (ReadFolder("").includes(val)) {
				return Chalk.redBright(NEW_TEXT.judgeExist);
			} else {
				return true;
			}
		}
	}, {
		message: NEW_TEXT.qaDesc,
		name: "desc",
		type: "input"
	}, {
		message: NEW_TEXT.qaKeyword,
		name: "keyword",
		type: "input",
		validate: val => {
			const regexp = /^[0-9a-z\u4e00-\u9fa5 ]*$/ig;
			if (!regexp.test(val)) {
				return Chalk.redBright(NEW_TEXT.judgeKeyword);
			} else {
				return true;
			}
		}
	}, {
		message: NEW_TEXT.qaLink,
		name: "homepage",
		type: "input",
		validate: val => {
			const regexp = /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[0-9A-Za-z][0-9A-Za-z-]{0,62}(\.[0-9A-Za-z][0-9A-Za-z-]{0,62})+(:\d+)*(\/\w+\.\w+)*([?&]\w+=\w*)*$/;
			if (!val) {
				return true;
			} else if (!regexp.test(val)) {
				return Chalk.redBright(NEW_TEXT.judgeLink);
			} else {
				return true;
			}
		}
	}, {
		message: NEW_TEXT.qaAuthor,
		name: "author",
		type: "input",
		validate: val => {
			const regexp = /^[0-9a-z\u4e00-\u9fa5-_ ]*$/ig;
			if (!val) {
				return Chalk.redBright(NEW_TEXT.judgeAuthorEmpty);
			} else if (!regexp.test(val)) {
				return Chalk.redBright(NEW_TEXT.judgeAuthorEmpty);
			} else {
				return true;
			}
		}
	}, {
		message: NEW_TEXT.qaPhone,
		name: "phone",
		type: "input",
		validate: val => {
			const regexp = /^1[3-9]\d{9}$|^([5|6|8|9])\d{7}$|^6([6|8])\d{5}$|^09\d{8}$/;
			if (!val) {
				return true;
			} else if (!regexp.test(val)) {
				return Chalk.redBright(NEW_TEXT.judgePhone);
			} else {
				return true;
			}
		}
	}, {
		message: NEW_TEXT.qaEmail,
		name: "email",
		type: "input",
		validate: val => {
			const regexp = /^([0-9A-Za-z-_.])+@([0-9A-Za-z])+.([0-9a-z]{2,4})$/;
			if (!val) {
				return true;
			} else if (!regexp.test(val)) {
				return Chalk.redBright(NEW_TEXT.judgeEmail);
			} else {
				return true;
			}
		}
	}];
	const answer = await Inquirer.prompt(question);
	const { author, desc, email, homepage, keyword, name, phone } = answer;
	const mkdir = Util.promisify(Fs.mkdir);
	const readFile = Util.promisify(Fs.readFile);
	const writeFile = Util.promisify(Fs.writeFile);
	await mkdir(AbsPath(name));
	for (let v of ReadFile("../template", 1)) {
		const srcPath = AbsPath(`../template/${v}`, 1);
		const distPath = AbsPath(`${name}/${v}`);
		let content = await readFile(srcPath, "utf8");
		if (v === "LICENSE" || v === "package.json") {
			content = content
				.replace(/#author#/g, TrimSpace(author))
				.replace(/#desc#/g, TrimSpace(desc))
				.replace(/#email#/g, email)
				.replace(/#homepage#/g, homepage)
				.replace(/#keyword#/g, JSON.stringify(TrimSpace(keyword).split(" ").filter(v => v)))
				.replace(/#name#/g, name)
				.replace(/#phone#/g, phone)
				.replace(/#year#/g, new Date().getFullYear());
		}
		await writeFile(distPath, content, "utf8");
	}
	console.log(Chalk.greenBright(NEW_TEXT.newSucceed));
};