// Configuration settings for the Minecraft bot
module.exports = {
  // Bot connection settings
  bot: {
    username: process.env.BOT_USERNAME || 'JhonnySins',
    host: process.env.SERVER_HOST || 'both-prototype.gl.joinmc.link',
    port: parseInt(process.env.SERVER_PORT) || 25565,
    version: process.env.MINECRAFT_VERSION || false // Auto-detect version
  },
  
  // Movement settings
  movement: {
    intervalSeconds: 30, // Move every 30 seconds
    durationMs: 1000     // Move for 1 second
  },
  
  // Chat settings
  chat: {
    intervalMinutes: 2,  // Send chat command every 2 minutes
    commands: [
      '/lagg clear',
      '/lagg gc',
      '/save-all',
      '/reload confirm',
      '/say Server cleanup complete!',
      '/memory',
      '/lagg reload',
      '/lagg killmobs',
      '/lagg halt',
      '/lagg area 1000',
    ]
  }
};
