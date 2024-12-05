const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db.js');
const Siswa = require('./model/siswa.js');
const User = require('./model/user.js');

const app = express();
const port = 3000;

//! Setup method override
app.use(methodOverride('_method'));

//! Setup EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//! Konfigurasi flash
app.use(cookieParser('secret'));
app.use(
    session({
        // cookie: { maxAge: 12 * 60 * 60 * 1000 }, // 12 jam
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
        cookie: {
            expires: false
        }
    })
);
app.use(flash());

//! Middleware untuk Melindungi Rute 
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
};

//! Halaman Login 
app.get('/login', (req, res) => { 
    res.render('login', { 
        title: 'Login | Dapodik', 
        layout: 'layouts/login-layout.ejs',
    }); 
});

//! Proses Login 
app.post('/login', 
    [ 
        body('username').notEmpty().withMessage('Username harus di isi!'), 
        body('password').notEmpty().withMessage('Password harus di isi!') 
    ],
    async (req, res) => {
        const errors = validationResult(req); 
        if (!errors.isEmpty()) { 
            console.log('Validation Errors:', errors.array()); 
            return res.status(400).json({ success: false, message: 'Username dan Password harus di isi!' }); 
        } 
        const { username, password } = req.body; 
        console.log('Mencoba masuk dengan', { username, password }); 
        try { 
            const user = await User.findOne({ username }); 
            if (!user || user.password !== password) {
                console.log('Username atau Password salah', { username, password });
                return res.status(400).json({ success: false, message: 'Username atau Password salah' }); 
            }
            req.session.user = { username, nama: user.nama }; 
            console.log('Berhasil login:', username); 
            return res.json({ success: true, message: 'Login berhasil!' }); 
        } catch (error) { 
            console.error('Terjadi kesalahan saat login:', error); 
            res.status(500).json({ success: false, message: 'Internal Server Error' }); 
        } 
    }
);

//! Halaman Logout 
app.get('/logout', (req, res) => {
    const username = req.session.user.username;
    req.session.destroy((err) => { 
        if (err) { 
            console.error('Terjadi kelasahan saat logout:', err); 
            return res.status(500).json({ success: false, message: 'Internal Server Error' }); 
        }
        console.log('Anda telah logout:', username);
        res.redirect('/login'); 
        }); 
    }
);

//! Halaman Utama
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', {
        nama: req.session.user.nama,
        title: 'Dashboard | Dapodik',
        favicon: 'img/favicon.png',
        judul: 'Dapodik',
        layout: 'layouts/main-layout.ejs',
    });
});

//! Halaman Data Siswa
app.get('/data-siswa', isAuthenticated, async (req, res) => {
    const Dsiswa = await Siswa.find();
    res.render('data-siswa', {
        title: 'Data Siswa | Dapodik',
        favicon: 'img/favicon.png',
        judul: 'Dapodik',
        layout: 'layouts/main-layout.ejs',
        Dsiswa,
        msg: req.flash('msg'),
    });
});

//! Halaman form tambah data siswa
app.get('/data-siswa/add', isAuthenticated, (req, res) => {
    res.render('add-data', {
        title: 'Tambah Data Siswa | Dapodik',
        favicon: 'img/favicon.png',
        judul: 'Dapodik',
        layout: 'layouts/main-layout.ejs',
        errors: null
    });
});

//! Proses Tambah Data Siswa
app.post('/data-siswa', isAuthenticated, 
    [
        //? Validasi jk,tingkat,rombel,terdaftar,ttl dan rgl_masuk wajib diisi
        body('jk').notEmpty().withMessage('Jenis Kelamin harus di isi'), 
        body('tingkat').notEmpty().withMessage('Tingkat harus di isi'), 
        body('rombel').notEmpty().withMessage('Rombel harus di isi'), 
        body('terdaftar').notEmpty().withMessage('Status Terdaftar harus di isi'), 
        body('ttl').notEmpty().withMessage('Tempat Tanggal Lahir harus di isi'),

        //? Validasi NISN untuk duplikasi dan panjang digit
        body('nisn').custom(async (value) => {
            const duplikat = await Siswa.findOne({ nisn: value });
            if (duplikat) {
                throw new Error('NISN Siswa sudah terdaftar!');
            }
            return true;
        }).isLength({ min: 10, max: 10 }).withMessage('NISN harus terdiri dari 10 digit angka').
        isNumeric().withMessage('NISN tidak valid!'),

        //? Validasi NIK untuk duplikasi dan panjang digit
        body('nik').custom(async (value) => {
            const duplikat = await Siswa.findOne({ nik: value });
            if (duplikat) {
                throw new Error('NIK Siswa sudah terdaftar!');
            }
            return true;
        }).isLength({ min: 16, max: 16 }).withMessage('NIK harus terdiri dari 16 digit angka').
        isNumeric().withMessage('NIK tidak valid!'),

        //? Validasi panjang digit NoKK 
        check('nokk', 'NoKK tidak valid!').isLength({ min: 16, max: 16 }).withMessage('NoKK harus terdiri dari 16 digit angka')
        .isNumeric().withMessage('NoKK tidak valid!'),

        //? Validasi tanggal masuk 
        check('tgl_masuk').custom((value, { req }) => {
            const today = new Date().toISOString().split('T')[0];
            if (value > today) { 
                throw new Error('Tanggal Masuk tidak boleh lebih dari hari ini'); 
            } return true;
        }).isISO8601().toDate()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('add-data', {
                title: 'Tambah Data Siswa | Dapodik',
                favicon: 'img/favicon.png',
                layout: 'layouts/main-layout.ejs',
                judul: 'Dapodik',
                errors: errors.array(),
            });
        } else {
            const newSiswa = new Siswa({
                ...req.body, tgl_masuk: req.body.tgl_masuk.toISOString().split('T')[0], //? Format YYYY-MM-DD 
            });
            await newSiswa.save(req.body);
            //? Kirimkan flash message
            req.flash('msg', `Data Siswa atas nama ${req.body.nama} berhasil ditambahkan`);
            res.redirect('/data-siswa');
        }
    }
);

//! Proses delete siswa
app.delete('/data-siswa/:nisn', isAuthenticated, (req, res) => {
    const { nisn } = req.params;
    const { nama } =req.body;
    Siswa.deleteOne({ nisn: nisn }).then((result) => {
        req.flash('msg', `Data siswa atas nama ${req.body.nama} berhasil dihapus`); 
        res.status(200).send();
    })
});

//! Form ubah data siswa
app.get('/data-siswa/detail/edit/:nisn', isAuthenticated, async (req, res) => {
    const siswa = await Siswa.findOne({ nisn: req.params.nisn });
    res.render('edit-data', {
        title: 'Edit Data Siswa | Dapodik',
        favicon: 'img/favicon.png',
        judul: 'Dapodik',
        layout: 'layouts/main-layout.ejs',
        errors: null,
        siswa,
    });
});

//! Proses ubah data siswa
app.put('/data-siswa', isAuthenticated, 
    [
        check('tingkat', 'Tingkat tidak valid').notEmpty(), 
        check('rombel', 'Rombel tidak valid').notEmpty(), 
        check('terdaftar', 'Status Terdaftar tidak valid').notEmpty(), 
        check('tgl_masuk').custom((value, { req }) => {
            const today = new Date().toISOString().split('T')[0];
            if (value > today) {
                throw new Error('Tanggal Masuk tidak boleh lebih dari hari ini');
            } return true;
        }).isISO8601().toDate()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('edit-data', {
                title: 'Edit Data Siswa | Dapodik',
                favicon: 'img/favicon.png',
                judul: 'Dapodik',
                layout: 'layouts/main-layout.ejs',
                errors: errors.array(),
                siswa: req.body,
            });
        } else {
            const { _id, nama, tingkat, rombel, terdaftar, tgl_masuk } = req.body;
            await Siswa.updateOne(
                { _id: _id },
                {
                    $set: {
                        tingkat: tingkat,
                        rombel: rombel,
                        terdaftar: terdaftar,
                        tgl_masuk: tgl_masuk.toISOString().split('T')[0],
                    },
                }
            ).then((result) => {
                //! Kirimkan flash message
                req.flash('msg', `Data Siswa atas nama ${nama} berhasil diupdate`);
                res.redirect('/data-siswa');
            });
        }
    }
);

//! Halaman detail Siswa
app.get('/data-siswa/detail/:nisn', isAuthenticated, async (req, res) => {
    const siswa = await Siswa.findOne({ nisn: req.params.nisn });
    res.render('detail', {
        title: 'Detail Data Siswa | Dapodik',
        favicon: 'img/favicon.png',
        judul: 'Dapodik',
        layout: 'layouts/main-layout.ejs',
        siswa,
    });
});

app.listen(port, () => {
    console.log(`Website Dapodik | Listening at http://localhost:${port}`);
});