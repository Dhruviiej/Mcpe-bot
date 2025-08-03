const mineflayer = require('mineflayer');
const config = require('./config');

class MinecraftBot {
  constructor() {
    this.bot = null;
    this.currentChatCommandIndex = 0;
    this.movementInterval = null;
    this.chatInterval = null;
    this.isMoving = false;
  }

  /**
   * Initialize and connect the bot to the Minecraft server
   */
  async connect() {
    console.log('🚀 Starting Minecraft bot...');
    console.log(`📡 Attempting to connect to ${config.bot.host}:${config.bot.port}`);
    console.log(`👤 Username: ${config.bot.username}`);

    try {
      this.bot = mineflayer.createBot({
        host: config.bot.host,
        port: config.bot.port,
        username: config.bot.username,
        version: config.bot.version
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('❌ Failed to create bot:', error.message);
      process.exit(1);
    }
  }

  /**
   * Set up event handlers for the bot
   */
  setupEventHandlers() {
    // Bot spawned successfully
    this.bot.on('spawn', () => {
      console.log('✅ Bot spawned!');
      console.log(`🌍 Connected to server: ${this.bot.game.serverBrand || 'Unknown'}`);
      console.log(`📍 Position: ${this.bot.entity.position.x.toFixed(2)}, ${this.bot.entity.position.y.toFixed(2)}, ${this.bot.entity.position.z.toFixed(2)}`);
      
      // Start automated functions
      this.startAutomatedMovement();
      this.startAutomatedChat();
    });

    // Connection established
    this.bot.on('login', () => {
      console.log('🔐 Successfully logged in to the server');
    });

    // Chat message received
    this.bot.on('chat', (username, message) => {
      if (username !== this.bot.username) {
        console.log(`💬 [${username}]: ${message}`);
      }
    });

    // Error handling
    this.bot.on('error', (err) => {
      console.error('❌ Bot error:', err.message);
      this.cleanup();
    });

    // Disconnection handling
    this.bot.on('end', () => {
      console.log('🔌 Bot disconnected from server');
      this.cleanup();
      
      // Attempt to reconnect after 5 seconds
      console.log('🔄 Attempting to reconnect in 5 seconds...');
      setTimeout(() => {
        this.connect();
      }, 5000);
    });

    // Kicked from server
    this.bot.on('kicked', (reason) => {
      console.log('👢 Bot was kicked from server:', reason);
      this.cleanup();
    });

    // Health and food updates
    this.bot.on('health', () => {
      if (this.bot.health <= 5) {
        console.log(`⚠️  Low health: ${this.bot.health}/20`);
      }
    });
  }

  /**
   * Start automated random movement every 30 seconds
   */
  startAutomatedMovement() {
    console.log('🏃 Starting automated movement system');
    
    this.movementInterval = setInterval(() => {
      if (!this.isMoving && this.bot.entity) {
        this.performRandomMovement();
      }
    }, config.movement.intervalSeconds * 1000);
  }

  /**
   * Perform random movement for 1 second
   */
  performRandomMovement() {
    const movements = ['forward', 'back', 'left', 'right'];
    const randomMovement = movements[Math.floor(Math.random() * movements.length)];
    
    console.log(`🎯 Performing random movement: ${randomMovement}`);
    this.isMoving = true;

    // Start movement
    this.bot.setControlState(randomMovement, true);

    // Stop movement after 1 second
    setTimeout(() => {
      this.bot.setControlState(randomMovement, false);
      this.isMoving = false;
      console.log(`✋ Stopped movement: ${randomMovement}`);
    }, config.movement.durationMs);
  }

  /**
   * Start automated chat commands every 2 minutes
   */
  startAutomatedChat() {
    console.log('💭 Starting automated chat system');
    
    this.chatInterval = setInterval(() => {
      this.sendNextChatCommand();
    }, config.chat.intervalMinutes * 60 * 1000);
  }

  /**
   * Send the next chat command from the predefined list
   */
  sendNextChatCommand() {
    const command = config.chat.commands[this.currentChatCommandIndex];
    
    try {
      console.log(`📤 Sending chat command: ${command}`);
      this.bot.chat(command);
      
      // Move to next command, loop back to start if at end
      this.currentChatCommandIndex = (this.currentChatCommandIndex + 1) % config.chat.commands.length;
      
      if (this.currentChatCommandIndex === 0) {
        console.log('🔄 Chat command list completed, starting over');
      }
    } catch (error) {
      console.error('❌ Failed to send chat command:', error.message);
    }
  }

  /**
   * Clean up intervals and resources
   */
  cleanup() {
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
      this.movementInterval = null;
      console.log('🧹 Cleaned up movement interval');
    }
    
    if (this.chatInterval) {
      clearInterval(this.chatInterval);
      this.chatInterval = null;
      console.log('🧹 Cleaned up chat interval');
    }
    
    this.isMoving = false;
  }

  /**
   * Gracefully shutdown the bot
   */
  shutdown() {
    console.log('🛑 Shutting down bot...');
    this.cleanup();
    
    if (this.bot) {
      this.bot.quit();
    }
    
    process.exit(0);
  }
}

// Handle process termination gracefully
const botInstance = new MinecraftBot();

process.on('SIGINT', () => {
  console.log('\n⚡ Received SIGINT signal');
  botInstance.shutdown();
});

process.on('SIGTERM', () => {
  console.log('\n⚡ Received SIGTERM signal');
  botInstance.shutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  botInstance.cleanup();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  botInstance.cleanup();
  process.exit(1);
});

// Start the bot
console.log('🤖 Minecraft Bot Starting...');
console.log('📋 Configuration:');
console.log(`   • Server: ${config.bot.host}:${config.bot.port}`);
console.log(`   • Username: ${config.bot.username}`);
console.log(`   • Movement interval: ${config.movement.intervalSeconds}s`);
console.log(`   • Chat interval: ${config.chat.intervalMinutes}m`);
console.log('');

// Validate server host
if (config.bot.host === 'localhost') {
  console.log('⚠️  Warning: Server host is set to localhost. Please set SERVER_HOST environment variable with the actual server IP.');
  console.log('   Example: SERVER_HOST=192.168.1.100 npm start');
  console.log('');
}

botInstance.connect();
