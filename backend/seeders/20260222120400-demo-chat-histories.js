'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('chat_histories', [
      {
        patient_id: 1, // Sarah Johnson
        message: 'Tell me about my birthday party',
        response: 'Looking at your photos, you celebrated your birthday on June 15th with your family. There was a beautiful cake and your daughter Amna was there with you. Everyone looked so happy!',
        mood_detected: 'curious',
        created_at: new Date('2024-02-15 10:30:00'),
        updated_at: new Date('2024-02-15 10:30:00')
      },
      {
        patient_id: 1, // Sarah Johnson
        message: 'Who is in the family photo?',
        response: 'That\'s your family reunion photo from Christmas 2022. Your daughter Amna is standing next to you, and your grandchildren are in the front row. It was a wonderful gathering at your home.',
        mood_detected: 'happy',
        created_at: new Date('2024-02-16 14:20:00'),
        updated_at: new Date('2024-02-16 14:20:00')
      },
      {
        patient_id: 1, // Sarah Johnson
        message: 'What did I say in my voice note?',
        response: 'In your morning voice note from January 10th, you talked about how beautiful the sunrise was and mentioned you were looking forward to your doctor\'s appointment that day.',
        mood_detected: 'calm',
        created_at: new Date('2024-02-17 09:15:00'),
        updated_at: new Date('2024-02-17 09:15:00')
      },
      {
        patient_id: 2, // John Anderson
        message: 'Show me my garden',
        response: 'Here\'s a lovely photo of your garden from August 2023. You can see your tomato plants and the rose bushes you\'re so proud of. Your son David took this photo.',
        mood_detected: 'nostalgic',
        created_at: new Date('2024-02-18 11:00:00'),
        updated_at: new Date('2024-02-18 11:00:00')
      },
      {
        patient_id: 2, // John Anderson
        message: 'Tell me about the fishing trip',
        response: 'Your fishing trip video from July 4th, 2021 shows you at the lake with your family. You caught a big bass that day! David captured the moment on video.',
        mood_detected: 'happy',
        created_at: new Date('2024-02-19 15:45:00'),
        updated_at: new Date('2024-02-19 15:45:00')
      },
      {
        patient_id: 3, // Mary Williams
        message: 'When did my grandchildren visit?',
        response: 'Your grandchildren visited you on Valentine\'s Day, February 14th, 2024. There\'s a wonderful photo of all of you together. They brought you flowers and spent the whole afternoon with you.',
        mood_detected: 'joyful',
        created_at: new Date('2024-02-20 16:30:00'),
        updated_at: new Date('2024-02-20 16:30:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('chat_histories', null, {});
  }
};
