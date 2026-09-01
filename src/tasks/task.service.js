import { pool } from "../config/database.js";


export const  getTasks = async () => {
    const result = await pool.query('SELECT * FROM tasks')
    return result.rows
    
}

export const  getTask = async (id) => {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    return result.rows[0]
    
}

// export const createUser = async(name,email)=>{
//     const result = await pool.query('INSERT INTO users (name, email) VALUES ($1,$2) RETURNING *' , [name,email]);
//     return result.rows[0]
// }
// export const updateUser = async(id , name , email)=>{
//     const result = await pool.query('UPDATE  users SET name =$1 , email =$2 WHERE id =$3 RETURNING *', [name,email,id])
//     return result.rows[0]
// }

// export const deleteTask = async(id)=>{
//     const result = await pool.query('DELETE  FROM users WHERE id = $1 ',[id])
//     return  result.rowCount
// }