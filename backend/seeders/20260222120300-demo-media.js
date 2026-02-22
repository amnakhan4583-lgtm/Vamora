'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('media', [
      {
        patient_id: 1, // Sarah Johnson
        media_type: 'photo',
        filename: 'birthday_celebration_2023.jpg',
        filepath: 'uploads/photos/birthday_celebration_2023.jpg',
        file_size: 2048000,
        mime_type: 'image/jpeg',
        uploaded_by: 4, // Amna (caregiver)
        created_at: new Date('2023-06-15'),
        updated_at: new Date('2023-06-15')
      },
      {
        patient_id: 1, // Sarah Johnson
        media_type: 'photo',
        filename: 'family_reunion_2022.jpg',
        filepath: 'uploads/photos/family_reunion_2022.jpg',
        file_size: 1856000,
        mime_type: 'image/jpeg',
        uploaded_by: 4, // Amna (caregiver)
        created_at: new Date('2022-12-25'),
        updated_at: new Date('2022-12-25')
      },
      {
        patient_id: 1, // Sarah Johnson
        media_type: 'audio',
        filename: 'voice_note_morning.mp3',
        filepath: 'uploads/audio/voice_note_morning.mp3',
        file_size: 512000,
        mime_type: 'audio/mpeg',
        uploaded_by: 1, // Sarah herself
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-10')
      },
      {
        patient_id: 2, // John Anderson
        media_type: 'photo',
        filename: 'garden_memories.jpg',
        filepath: 'uploads/photos/garden_memories.jpg',
        file_size: 1920000,
        mime_type: 'image/jpeg',
        uploaded_by: 5, // David (caregiver)
        created_at: new Date('2023-08-20'),
        updated_at: new Date('2023-08-20')
      },
      {
        patient_id: 2, // John Anderson
        media_type: 'video',
        filename: 'fishing_trip_2021.mp4',
        filepath: 'uploads/videos/fishing_trip_2021.mp4',
        file_size: 15360000,
        mime_type: 'video/mp4',
        uploaded_by: 5, // David (caregiver)
        created_at: new Date('2021-07-04'),
        updated_at: new Date('2021-07-04')
      },
      {
        patient_id: 3, // Mary Williams
        media_type: 'photo',
        filename: 'grandchildren_visit.jpg',
        filepath: 'uploads/photos/grandchildren_visit.jpg',
        file_size: 2304000,
        mime_type: 'image/jpeg',
        uploaded_by: 4, // Amna (caregiver)
        created_at: new Date('2024-02-14'),
        updated_at: new Date('2024-02-14')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('media', null, {});
  }
};
