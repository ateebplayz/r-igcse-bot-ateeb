import type { MCQ, Subject } from "@/mongo/schemas/Question";
import type { DiscordClient } from "@/registry/DiscordClient";
import BaseCommand, {
	type DiscordChatInputCommandInteraction,
} from "@/registry/Structure/BaseCommand";
import { ActionRowBuilder } from "@discordjs/builders";
import { Colors, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";
import { v4 } from "uuid";

export default class PingCommand extends BaseCommand {
	constructor() {
		super(
			new SlashCommandBuilder().setName("practiceateeb").setDescription("Start an MCQ practice session!")
				.addStringOption(opt =>
					opt
						.setName('board')
						.setDescription('Which board questions would you like to see? (A Level/AS Level/IGCSE)')
						.setRequired(true)
						.setChoices(
							{ name: 'A Level', value: 'a' },
                            { name: 'AS Level', value: 'as' },
                            { name: 'IGCSE', value: 'igcse' },
						)
				)
				.addIntegerOption(opt =>
					opt
						.setName('amount')
						.setDescription(`Amount of MCQ's to go through (Maximum 250)`)
						.setMaxValue(250)
						.setMinValue(1)
						.setRequired(true)
				)
				.addIntegerOption(opt =>
					opt
						.setName('minimum-year')
						.setDescription(`The minimum year of MCQ's to show inclusive (Maximum 2010)`)
						.setMaxValue(2022)
						.setMinValue(2010)
						.setRequired(true)
				)
		);
	}

	async execute(
		client: DiscordClient<true>,
		interaction: DiscordChatInputCommandInteraction,
	) {
		await interaction.deferReply();

		const embed = new EmbedBuilder().setAuthor({
			name: `Your Session`,
			iconURL: client.user.displayAvatarURL()
		})
			.setColor(Colors.Blurple)
			.setDescription("Please choose your session's subjects from the dropdown below. You can select more than one subject now.")
		const board = interaction.options.getString('board');
		let subjectList: Array<Subject> = []
		await fetch(`http://localhost:3000/questionify/list?type=boards&query=${board}`).then((response) =>{
			response.json().then((r) => {
				subjectList = (r as {data: Array<Subject>}).data
			})
		})
		const subjectListSelectMenuUuid = v4()
		let subjectListSelectMenuOptions: Array<StringSelectMenuOptionBuilder> = []
		subjectList.forEach(subject => {
			subjectListSelectMenuOptions.push(
				new StringSelectMenuOptionBuilder()
					.setValue(`${subject.code}`)
					.setLabel(`${subject.name} (${subject.code})`)
					.setDescription(`Go through the MCQs present in papers of ${subject.name} (${subject.code})`)
			)
		})
		const subjectListSelectMenu = new StringSelectMenuBuilder()
			.setCustomId(subjectListSelectMenuUuid)
			.setMaxValues(subjectList.length)
			.setMinValues(1)
			.setPlaceholder('Select your Subjects')
			.setOptions(subjectListSelectMenuOptions)
		const subjectListActionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(subjectListSelectMenu)
		const followUpReply = await interaction.followUp({
			embeds: [embed],
			components: [subjectListActionRow]
		});
		await followUpReply.awaitMessageComponent({filter: (i) => i.customId === subjectListSelectMenuUuid, time: 300_000, componentType: ComponentType.StringSelect}).then(async (i: StringSelectMenuInteraction)=>{
			let mcqs: Array<MCQ> = []
			const mcqAmount = interaction.options.getInteger('amount', true)
			await fetch(`http://localhost:3000/questionify/random?amount=${mcqAmount}&code=${i.values[0]}&board=${board}`).then((response) =>{
				response.json().then((r) => {
					console.log(r)
					mcqs = (r as {data: Array<MCQ>}).data
				})
			})
			console.log(mcqs)
			mcqs.forEach(async (mcq) => {
				interaction.followUp({embeds: [new EmbedBuilder().setAuthor({name: 'Helloworld'}).setImage(mcq.question)]})
				await new Promise(r => setTimeout(r, 5000))
			})
		})
	}
}