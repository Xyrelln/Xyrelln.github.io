// code modified from https://github.com/mongodb-developer/mongodb-typescript-example/tree/finish
import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";

export const favoritesRouter = express.Router();

favoritesRouter.use(express.json());

favoritesRouter.get("/", async (_req: Request, res: Response) => {
    try {
        // Call find with an empty filter object, meaning it returns all documents in the collection. Saves as Game array to take advantage of types
        const favorites = await collections.favorites?.find({}).toArray();

        res.status(200).send(favorites);
    } catch (error) {
        if (error instanceof Error) {
          res.status(500).send(error.message);
        }
        res.status(500).send('get from db failed');
    }
});

// Example route: http://localhost:8080/favorites/610aaf458025d42e7ca9fcd0
favoritesRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        // _id in MongoDB is an objectID type so we need to find our specific document by querying
        const query = { _id: new ObjectId(id) };
        const game = await collections.favorites?.findOne(query);

        if (game) {
            res.status(200).send(game);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

favoritesRouter.post("/", async (req: Request, res: Response) => {
    try {
        const newFav = req.body;
        const result = await collections.favorites?.insertOne(newFav);

        result
            ? res.status(201).send(`Successfully created a new favorite city with id ${result.insertedId}`)
            : res.status(500).send("Failed to create a new favorite.");
    } catch (error) {
        if (error instanceof Error) {
          res.status(500).send(error.message);
        }
        res.status(500).send('post to db failed');
    }
});

favoritesRouter.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const updatedGame = req.body;
        const query = { _id: new ObjectId(id) };
        // $set adds or updates all fields
        const result = await collections.favorites?.updateOne(query, { $set: updatedGame });

        result
            ? res.status(200).send(`Successfully updated favorite with id ${id}`)
            : res.status(304).send(`Favorite with id: ${id} not updated`);
    } catch (error) {
        if (error instanceof Error) {
          res.status(500).send(error.message);
        }
        res.status(500).send('put to db failed');
    }
});

favoritesRouter.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        const result = await collections.favorites?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed favorite with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove favorite with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Favorite with id ${id} does not exist`);
        }
    } catch (error) {
        if (error instanceof Error) {
          res.status(500).send(error.message);
        }
        res.status(500).send('delete from db failed');
    }
});


favoritesRouter.delete("/", async (req: Request, res: Response) => {
    const { city, state } = req.body;

    if (!city || !state) {
        res.status(400).send("Bad Request: missing city or state");
    }

    try {
        const query = { city: city, state: state };
        const result = await collections.favorites?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed favorite with city: ${city} and state: ${state}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove favorite with city: ${city} and state: ${state}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Favorite with city: ${city} and state: ${state} does not exist`);
        }
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send(error.message);
        } else {
            res.status(500).send("delete from db failed");
        }
    }
});