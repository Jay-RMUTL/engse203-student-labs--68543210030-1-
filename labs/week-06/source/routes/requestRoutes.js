import express from "express"
import * as controller from "../controllers/requestController.js"

const router = express.Router()

router.get("/", controller.getRequests)
router.get("/:id", controller.getRequest)
router.post("/", controller.createRequest)
router.put("/:id", controller.updateStatus)
router.delete("/:id", controller.removeRequest)

export default router