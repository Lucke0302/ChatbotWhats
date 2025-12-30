module.exports = {
  apps : [{
    name: 'bostossauro',
    script: 'Source/index.js',
    watch: true,
    ignore_watch : [
	"usage_stats.json",
        "auth_info_baileys/.", 
        "chat_history.db", 
        "chat_history.db-journal", 
        "chat_history.db-wal"
    ],
  }]
};
