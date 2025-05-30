const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const metroConfig = require('../../config/metro/metroConfig');
const TimeHelpers = require('../../modules/chronos/timeHelpers');

module.exports = {
    parentCommand: 'tarifa',
    data: (subcommand) => subcommand
        .setName('diferenciada')
        .setDescription('Consulta tarifas diferenciadas del Metro')
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Tipo de tarifa a consultar')
                .setRequired(true)
                .addChoices(
                    { name: 'Normal (BIP)', value: 'normal' },
                    { name: 'Estudiante (TNE)', value: 'estudiante' },
                    { name: 'Adulto Mayor', value: 'adulto_mayor' },
                    { name: 'BIP Adulto Mayor', value: 'bip_adulto_mayor' },
                    { name: 'NOS', value: 'nos' },
                    { name: 'Red', value: 'transantiago' }
                )),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: false });
            const fareType = interaction.options.getString('tipo');
            await this.showSpecificFare(interaction, fareType);
        } catch (error) {
            console.error('Error en /tarifa diferenciada:', error);
            await interaction.editReply({
                content: '❌ Error al obtener información de tarifas',
                ephemeral: true
            });
        }
    },

    async showSpecificFare(interaction, fareType) {
        const fareConfig = {
            'normal': { 
                keys: ['t_metro_punta', 't_metro_valle', 't_metro_bajo'], 
                name: 'Tarifa Normal (BIP)',
                emoji: metroConfig.accessCards.bip,
                description: 'Tarifa estándar para usuarios con tarjeta BIP'
            },
            'estudiante': { 
                keys: ['t_estudiante_punta', 't_estudiante_valle', 't_estudiante_bajo'], 
                name: 'Tarifa Estudiante (TNE)',
                emoji: metroConfig.accessCards.tne,
                description: 'Tarifa especial para estudiantes con TNE'
            },
            'adulto_mayor': { 
                keys: ['t_adulto_punta', 't_adulto_valle', 't_adulto_bajo'], 
                name: 'Tarifa Adulto Mayor',
                emoji: metroConfig.accessCards.tarjetaAdultoMayor,
                description: 'Tarifa para adultos mayores (60+ años)'
            },
            'bip_adulto_mayor': { 
                keys: ['t_adultobip_punta', 't_adultobip_valle', 't_adultobip_bajo'], 
                name: 'BIP Adulto Mayor',
                emoji: metroConfig.accessCards.bipAdultoMayor,
                description: 'Tarifa con tarjeta BIP para adultos mayores'
            },
            'nos': { 
                keys: ['t_nos_punta', 't_nos_valle', 't_nos_bajo'], 
                name: 'Tarifa NOS',
                emoji: '🟢',
                description: 'Tarifa para usuarios del sistema NOS'
            },
            'transantiago': { 
                keys: ['t_transantiago'], 
                name: 'Tarifa Red',
                emoji: '🚌',
                description: 'Tarifa integrada con buses Red'
            }
        };

        const config = fareConfig[fareType];
        const currentPeriod = TimeHelpers.getCurrentPeriod();
        
        // Handle flat fares (like 'transantiago') that don't vary by period
        const isFlatFare = fareType === 'transantiago';
        const flatFareValue = isFlatFare ? metroConfig.tarifario[config.keys[0]] : null;

        const embed = new EmbedBuilder()
            .setTitle(`${config.emoji} ${config.name}`)
            .setDescription(config.description)
            .setColor(0xFFD700)
            .setThumbnail(metroConfig.metroLogo.v4);

        if (isFlatFare) {
            embed.addFields({
                name: '💰 Tarifa Única',
                value: `**$${flatFareValue}**`,
                inline: false
            });
        } else {
            embed.addFields(
                {
                    name: '🚨 Hora Punta',
                    value: `**$${metroConfig.tarifario[config.keys[0]] || 'N/A'}**`,
                    inline: true
                },
                {
                    name: `🟢 Horario Normal ${currentPeriod.type === 'VALLE' ? '(ACTUAL)' : ''}`,
                    value: `**$${metroConfig.tarifario[config.keys[1]] || 'N/A'}**`,
                    inline: true
                },
                {
                    name: '🔵 Horario Bajo',
                    value: `**$${metroConfig.tarifario[config.keys[2]] || 'N/A'}**`,
                    inline: true
                }
            );
        }

        embed.addFields({
            name: '⏰ Período Actual',
            value: `**${currentPeriod.name}**\n${TimeHelpers.formatTime(new Date())}`,
            inline: false
        });

        embed.setFooter({ 
            text: 'Tarifas sujetas a cambios', 
            iconURL: metroConfig.metroLogo.principal 
        });

        await interaction.editReply({ embeds: [embed] });
    }
};