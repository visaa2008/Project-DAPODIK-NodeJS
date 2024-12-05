const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/dapodik');

// //! Membuat Skema user 
// const UserSchema = new mongoose.Schema({ 
//     nama: { 
//         type: String, 
//         required: true, 
//     }, 
//     username: { 
//         type: String, 
//         required: true, 
//         unique: true, 
//     }, 
//     password: { 
//         type: String, 
//         required: true, 
//     } 
// }, { collection: 'user' }); 
// const User = mongoose.model('User', UserSchema);

// //! Membuat Skema siswa
// const SiswaSchema = new mongoose.Schema({
//     nama: {
//         type: String,
//         required: true,
//     },
//     jk: {
//         type: String,
//         required: true,
//     },
//     nisn: {
//         type: String,
//         required: true,
//     },
//     nik: {
//         type: String,
//         required: true,
//     },
//     nokk: {
//         type: String,
//         required: true,
//     },
//     tingkat: {
//         type: String,
//         required: true,
//     },
//     rombel: {
//         type: String,
//         required: true,
//     },
//     terdaftar: {
//         type: String,
//         required: true,
//     },
//     ttl: {
//         type: String,
//         required: true,
//     },
//     tgl_masuk: {
//         type: String,
//         required: true,
//     }
//     // timestamp: {
//     //     type: Date,
//     //     default: Date.now,
//     // }
// }, { collection: 'siswa' });
// const Siswa = mongoose.model('Siswa', SiswaSchema);

//! Menambah 1 data user
// const user1 = new User({
//     nama: 'Bagus Maulana',
//     username: 'admin',
//     password: 'admin123',
// });

//! Menambah 1 data siswa
// const siswa1 = new Siswa({
//     nama: 'Bagus Maulana',
//     jk: 'Laki-Laki',
//     nisn: '12334',
//     nik: '23434',
//     nokk: '2354345',
//     tingkat: 'XI',
//     rombel: 'RPL 1',
//     terdaftar: "Siswa Baru",
//     ttl: 'Cirebon, 04 Agustus 2008',
//     tgl_masuk: '2024-11-24',
// });

//! Simpan ke collection user
// user1.save().then((user) => console.log(user));
//! Simpan ke collection siswa
// siswa1.save().then((siswa) => console.log(siswa));