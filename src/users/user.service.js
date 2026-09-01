import { pool } from "../config/database.js";


export const  getUsers = async () => {
    const result = await pool.query('SELECT * FROM users')
    return result.rows
    
}

export const  getUser = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0]
    
}

export const createUser = async(name,email)=>{
    const result = await pool.query('INSERT INTO users (name, email) VALUES ($1,$2) RETURNING *' , [name,email]);
    return result.rows[0]
}
export const updateUser = async(id , name , email)=>{
    const result = await pool.query('UPDATE  users SET name =$1 , email =$2 WHERE id =$3 RETURNING *', [name,email,id])
    return result.rows[0]
}

export const deleteUser = async(id)=>{
    const result = await pool.query('DELETE  FROM users WHERE id = $1 ',[id])
    return  result.rowCount
}