import { FastifyPluginAsync, RouteShorthandOptions } from 'fastify'
import {User} from '../modules/user_entity'
import { getRepository } from 'typeorm';
import { Static, Type } from '@sinclair/typebox';

const BasicBody = Type.Object({
  name: Type.String(),
  email: Type.String(),
})

const Params = Type.Object({
  id: Type.Number(),
})

type params = Static<typeof Params>;
type bodySchema = Static<typeof BasicBody>;


const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const userRepo = await getRepository(User)

  const idSchema: RouteShorthandOptions = {
    schema: {
      params: {
        properties: {
          id: {
          type: "number"
        }}
      },
      response: {
        200: {
          properties: {
            results: { 
              value: {type:"object"}
            }
          }
        }
      }
    }
  } 

  const ParamsSchema: RouteShorthandOptions = {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            list_of_users: {type: "array"}
          }
        }
      }
    }
  }

  const getSingleUser: RouteShorthandOptions = {
    schema: {
      params: Params,
      response: {
        203: {
          type: "object"
        }
      }
    }
  }

  const userSchema: RouteShorthandOptions = {
    schema: {
      body: BasicBody,
      response: {
        201: {
          type: "object",
          properties: {
            name: { type: "string" }, 
            email: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" }
          }
        }
      }
    }
  }
  fastify.post<{ Body: bodySchema }>('/user', userSchema, async (request, reply) => {
    const userObject = ({ 
      name: request.body.name,
      email: request.body.email
    })
    const saveUser = await userRepo.insert(userObject);
    console.log(userObject)
    reply.send(saveUser)
  })

  fastify.get('/getusers', ParamsSchema, async (req, reply) => {
    const result = await userRepo.find()
    reply.send({list_of_users: result});
  })

  fastify.get<{Params: params}>('/getuser/:id', getSingleUser, async (req, reply) => {
    const user = req.params.id
    const found_user = await userRepo.findOne(user)
    reply.send(found_user)
  })

  fastify.patch<{Body: bodySchema, Params: params}>('/patchuser/:id', idSchema, async (req, reply) => {
    const selected_id_by_user = req.params.id
    const userObject = ({
      name: req.body.name,
      email: req.body.email
    })
    const update_user = await userRepo.update(selected_id_by_user, userObject)
    console.log(update_user)
    reply.send({results : update_user})
  })


  fastify.delete<{Params: params}>('/deleteuser/:id', idSchema, async (req, reply) => {
    const sel_use = req.params.id;
    const delete_user = await userRepo.delete(sel_use)
    console.log("User deleted", delete_user)
    reply.send({ results: delete_user });
  })
}
export default root;
