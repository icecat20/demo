const hapi = require("@hapi/hapi");
const HapiPostgresConnection = require("hapi-postgres-connection");
const pg = require("pg");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");
const Package = require("./package.json");
const Joi = require("joi");

const init = async () => {
  const server = hapi.server({
    port: 1234,
    host: "localhost",
  });

  // server.register(plugins,(err)=>{
  //   if(err)
  //   {
  //     console.log(err);
  //   }
  // });
  const swaggerOptions = {
    info: {
      title: "Test API Documentation",
      version: Package.version,
    },
  };

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
    {
      plugin: HapiPostgresConnection,
    },
  ]);

  try {
    await server.start();
    console.log("Server running at:", server.info.uri);
  } catch (err) {
    console.log(err);
  }

  server.route([
    {
      method: "GET",
      path: "/api/get",
      options: {
        description: "get user",
        notes: "Returns user",
        tags: ["api", "add"],
        handler: async function (request, h) {
          let select = `SELECT * FROM use`;
          try {
            const result = await request.pg.client.query(select);
            return h.response({
              message: "ok",
              data: result.rows,
            });
          } catch (err) {
            console.log(err);
          }
        },
      },
    },
    {
      method: "PUT",
      path: "/api/add",
      options: {
        description: "add user",
        notes: "Returns user",
        tags: ["api"],
        handler: async function (request, h) {
          const add = `INSERT INTO use(name, lastname, age)
          VALUES ('${request.payload.name}','${request.payload.lastname}',${request.payload.age})`;
          const result = await request.pg.client.query(add);
          return h.response({
            message: "oke",
            result: result.rows[0],
          });
        },
        validate: {
          payload: Joi.object({
            name: Joi.string().required(),
            lastname: Joi.string().required(),
            age: Joi.number().required(),
          }),
        },
      },
    },
    {
      method: "DELETE",
      path: "/api/detele/{id}",
      options: {
        description: "detele user",
        notes: "Returns user",
        tags: ["api"],
        handler: async function (request, h) {
          const deleteUser = `DELETE FROM use
        WHERE id=${parseInt(request.params.id)}`;
          const result = await request.pg.client.query(deleteUser);
          return h.response({
            message: "oke",
            result: result.rows,
          });
        },
        validate: {
          params: Joi.object({
            id: Joi.number(),
          }),
        },
      },
    },
    {
      method: "POST",
      path: "/api/edit-user/{id}",
      options: {
        description: "edit user",
        notes: "edit user",
        tags: ["api"],
        handler: async function (request, h) {
          const editUser = `UPDATE use
        SET name='${request.payload.name}', lastname ='${
            request.payload.lastname
          }', age=${request.payload.age}
        WHERE id=${parseInt(request.params.id)}`;
          const result = await request.pg.client.query(editUser);
          return h.response({
            message: "oke",
            result: result.rows,
          });
        },
        validate: {
          params: Joi.object({
            id: Joi.number(),
          }),
          payload: Joi.object({
            name: Joi.string().required(),
            lastname: Joi.string().required(),
            age: Joi.number().required(),
          }),
        },
      },
    },
  ]);

  await server.start();
  console.log("server running on %S ", server.info.uri);
};
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
