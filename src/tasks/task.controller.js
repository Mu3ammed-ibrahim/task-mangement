import { getTasks , getTask } from "./task.service.js";
export const getTasksController =  async (req,res,next) => {
      try {
        const tasks = await getTasks();
        res.status(200).json(tasks)
            
        } catch (error) {
            return next(error)
        }
    
}
export const getTaskController =  async (req,res,next) => {
      try {
        const {id} = req.params;
        const task = await getTask(id);
        if(!task) return res.status(404).json({message : "task cannot be found"})
        return res.status(200).json(task)
            
        } catch (error) {
            return next(error)
        }
    
}

