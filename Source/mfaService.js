class MfaService {
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    formatPhone(phone) {
        let cleaned = phone.toString().replace(/\D/g, '');
        
        if (!cleaned.includes('@s.whatsapp.net')) {
            cleaned += '@s.whatsapp.net';
        }
        return cleaned;
    }
}

module.exports = new MfaService();