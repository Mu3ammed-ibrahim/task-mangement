import { getTasks, getTask, createTask, updateTask, patchTask, deleteTask } from "./task.service.js";
export const getTasksController =  async (req,res,next) => {
      try {
        const { status, priority, search, sort, order, page, limit } = req.query;
        const userId = req.user.userId;
        const tasks = await getTasks(userId, status, priority, search, sort, order, page, limit);
        res.status(200).json(tasks)
            
        } catch (error) {
            return next(error)
        }
    
}
export const getTaskController =  async (req,res,next) => {
      try {
        const {id} = req.params;
        const userId = req.user.userId;
        const task = await getTask(userId, id);
        if (!task) return res.status(404).json({ message: "task cannot be found" });
        return res.status(200).json(task)
            
        } catch (error) {
            return next(error)
        }
    
}

export const postTaskController = async(req,res,next)=>{
    try {
        const {title,description,status,priority,due_date} = req.body;
        const userId = req.user.userId;
        const createNewTask = await createTask(userId, title, description, status, priority, due_date)
        return res.status(201).json(createNewTask)
        
    } catch (error) {
            return next(error)
        
    }
}

export const updateTaskController = async (req,res,next) => {
   try{
    const {id} = req.params;
    const {title,description,status,priority,due_date} = req.body ;
    const userId = req.user.userId;
    const updateTaskById = await updateTask(id,userId,title,description,status,priority,due_date)
    if(!updateTaskById){
        return res.status(404).json({message : "task is not found"})
    }
    return res.status(200).json(updateTaskById)
    
    
   } catch (error) {
    return next(error)
    
   }
}

export const deleteTaskController = async (req,res,next) => {
    try {
        const {id} = req.params;
        const userId = req.user.userId;
        const deleteTaskById = await deleteTask(id,userId)
        if(deleteTaskById === 0){
            return res.status(404).json({ message : 'task is not found'})
        }
        return res.status(204).send()
    } catch (error) {
        return next(error)
    }   
    
}

export const patchTaskController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const {
            title,
            description,
            status,
            priority,
            due_date
        } = req.body;

        if (
            title === undefined &&
            description === undefined &&
            status === undefined &&
            priority === undefined &&
            due_date === undefined
        ) {
            return res.status(400).json({
                message: "No fields provided to update"
            });
        }


        const updatedTask = await patchTask(
            id,
            userId,
            title,
            description,
            status,
            priority,
            due_date
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json(updatedTask);

    } catch (error) {
        return next(error);
    }
};
