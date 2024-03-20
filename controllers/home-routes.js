const router = require('express').Router();
const { Post, User, Comment } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['name'],
        },
        {
          model: Comment,
          attributes: ['comment_body']
        }
      ],
    });

    const post = postData.map((post) => post.get({ plain: true }));

    res.render('homepage', { 
      post, 
      logged_in: req.session.logged_in 
    })
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/post/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        },
        {
          model: Comment,
          include: [User]
        }
      ],
    });

    const post = postData.get({ plain: true });

    res.render('post', {
      ...post,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.redirect('login')
  }
});

router.get('/dashboard', withAuth, async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Post,
          include: [User] 
        },
      {
        model: Comment
      }],
    });

    const user = userData.get({ plain: true });

    res.render('dashboard', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/create', async (req, res) => {
  try {
    if (req.session.logged_in) {
      res.render('create', {
        logged_in: req.session.logged_in,
        userId: req.session.user_id
      })
      return
    } else {
      res.redirect('/login')
    }
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get('/create/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name']
        },
        {
          model: Comment,
          include: [User]
        }
      ]
    })
    const post = postData.get({ plain: true })

    if (req.session.logged_in) {
      res.render('edit', {
        ...post,
        logged_in: req.session.logged_in,
        userId: req.session.user_id
      })
      return
    } else {
      res.redirect('/login')
    }

  } catch (err) {
    res.status(500).json(err)
  }
})

router.all('/login', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('login');
});

module.exports = router;