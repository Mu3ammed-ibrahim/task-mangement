import { pool } from "../config/database.js";


    export const  getTasks = async (status , priority , search ,sort ,order,page,limit) => {
        // before we where writing get sql directly , now its more fliexalble to add fliter and sort and order 
        // meaning we pin one line of query and its SELECT * FROM tasks ...... then the rest will come if a certin condition is fullfiled 
        let query = "SELECT tasks.id AS task_id, tasks.title, tasks.status, users.name AS user_name, users.email AS user_email FROM tasks INNER JOIN users ON tasks.user_id = users.id"
        let countQuery = "SELECT COUNT(*) FROM tasks"
        const values = []
        // this array will decide $1 or $2 depending on values array
        const conditions =[]
        // sorting will not be random will depend on these array values
        const allowedSortFileds = ["created_at", "due_date","priority"]
        // order will only be two values 
        const allowedOrder = ["ASC","DESC"]
        const pageNumber = Number(page) || 1
        const limitNumber = Number(limit) || 10;
        const offset = (pageNumber - 1) * limitNumber;
    
        if(status){
            values.push(status)
            conditions.push(` status = $${values.length}`)
        }
        if(priority){
            values.push(priority)
            conditions.push(`priority = $${values.length}`)
        }
        if (search) { 
            values.push(`%${search.trim()}%`)
            conditions.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`)
        }
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
            countQuery += ` WHERE ${conditions.join(" AND ")}`
        }
        if(sort && allowedSortFileds.includes(sort)){
            const normalaizedOrder = order ? order.toUpperCase() : "ASC"
            const safeOrder = allowedOrder.includes(normalaizedOrder) ? normalaizedOrder : "ASC"

            query += ` ORDER BY ${sort} ${safeOrder}`;
            
        }
        const countResult = await pool.query(countQuery , values)
        const total = Number(countResult.rows[0].count)
        const totalPages = Math.ceil(total/limitNumber)


        console.log(countResult.rows)
        
        values.push(limitNumber)
        query += ` LIMIT $${values.length}`
        values.push(offset)
        query +=` OFFSET $${values.length}`
        console.log(query);
        console.log(values);
            const result = await pool.query(query, values);
            
            
        return {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages,
            tasks: result.rows
        };
        
    }

export const  getTask = async (id) => {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    return result.rows[0]
    
}

export const createTask = async(user_id,title,description,status,priority,due_date)=>{
    const result = await pool.query('INSERT INTO tasks (user_id,title,description,status,priority,due_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *' , [user_id,title,description,status,priority,due_date]);
    return result.rows[0]
}
export const updateTask = async(id,user_id,title,description,status,priority,due_date)=>{
    const result = await pool.query('UPDATE  tasks SET user_id =$2 , title =$3, description=$4 , status=$5 ,priority=$6  ,due_date=$7 WHERE id =$1 RETURNING *', [id,user_id,title,description,status,priority,due_date])
    return result.rows[0]
}

export const deleteTask = async(id)=>{
    const result = await pool.query('DELETE  FROM tasks WHERE id = $1 ',[id])
    return  result.rowCount
}

export const patchTask = async (id ,title,description,status,priority,due_date) => {
    const values = []
    const updates = []

    if(title){
        values.push(title)
        updates.push(` title = $${values.length}`)
    }
    if(description){
        values.push(description)
        updates.push(` description = $${values.length}`)
    }
    
    if(status){
        
        values.push(status)
        updates.push(` status = $${values.length}`)
    }
    if(priority){
        values.push(priority)
        updates.push(` priority = $${values.length}`)
    }
    
    if(due_date){
        values.push(due_date)
        updates.push(` due_date = $${values.length}`)
    }

    const setClause = updates.join(", ");

    values.push(id);

    const query = `
        UPDATE tasks
        SET ${setClause}
        WHERE id = $${values.length}
        RETURNING *
    `;

    const result = await pool.query(query, values);

    return result.rows[0];}