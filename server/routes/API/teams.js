const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route GET /teams
 * @desc GET all posts
 * @access Private (TODO)
 */

router.get('/', async (req, res) => {
    try {
        // Fetch all posts
        const teams = await prisma.team.findMany();

        res.status(200).json(teams);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Something went wrong'});
    }
})

/**
 * @route GET /teams/:id
 * @desc Get a specific post by id for the logged-in user
 * @access Private
 */
router.get('/:id', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);

    try {
        // Fetch the post by id
        const team = await prisma.team.findUnique({
            where: {
                id: teamId,
            },
        });

        // Check if the post exists
        if (!team) {
            return res.status(404).json({ error: 'Post not found or you do not have access to this post' });
        }

        res.status(200).json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

/**
 * @route GET /teams/:id/ohlc
 * @desc Get OHLC data for a specific team
 * @access Public
 */
router.get('/:id/ohlc', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);

    try {
        // Fetch OHLC data for the team
        const ohlcData = await prisma.ohlc.findMany({
            where: {
                teamId: teamId,
            },
            orderBy: {
                date: 'asc', // Order by date ascending
            },
        });

        res.status(200).json(ohlcData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;