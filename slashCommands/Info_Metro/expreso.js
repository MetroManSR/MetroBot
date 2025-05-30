const { SlashCommandBuilder } = require('discord.js');
const MetroCore = require('../../modules/metro/core/MetroCore');
const info = require('./_expinfo'); 
const ayuda = require('./_expayuda'); 
// Subcommand file

module.exports = {
    data: new SlashCommandBuilder()
        .setName('expreso')
        .setDescription('Información sobre rutas expresas del Metro de Santiago')
        .addSubcommand(subcommand => info.data(subcommand)) // Add info subcommand
    .addSubcommand(subcommand => ayuda.data(subcommand)), 

    category: "Metro Info",
    
    async getMetroCore(interaction) {
        try {
            if (!interaction.client.metroCore || !interaction.client.metroCore.api) {
                interaction.client.metroCore = await MetroCore.getInstance({ 
                    client: interaction.client 
                });
            }
            return interaction.client.metroCore;
        } catch (error) {
            console.error('Failed to get MetroCore instance:', error);
            throw new Error('El sistema Metro no está disponible');
        }
    },

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        try {
            const metro = await this.getMetroCore(interaction);
            
            switch(subcommand) {
                case 'info':
                    return info.execute(interaction, metro);
                    case 'ayuda':

                    return ayuda.execute(interaction);
                default:
                    return interaction.reply({ 
                        content: '⚠️ Subcomando no reconocido', 
                        ephemeral: true 
                    });
            }
        } catch (error) {
            console.error(`Error in /expreso ${subcommand}:`, error);
            return interaction.reply({
                content: '❌ Error al obtener información de rutas expresas',
                ephemeral: true
            });
        }
    }
};