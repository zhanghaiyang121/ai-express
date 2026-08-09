/**
 * Swagger / OpenAPI 规范配置
 * 在线文档访问地址: http://localhost:3000/api-docs
 */
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '电商后台管理系统 API',
      version: '1.0.0',
      description: '基于 Express 框架的电商后台管理系统 RESTful API 接口文档',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '本地开发服务器',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '在登录接口获取 Token 后填入此处，格式: Bearer <token>',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', description: '状态码', example: 200 },
            message: { type: 'string', description: '提示信息', example: '操作成功' },
            data: { type: 'object', description: '响应数据' },
          },
        },
        UserInfo: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '用户ID', example: 1 },
            username: { type: 'string', description: '用户名', example: 'admin' },
            nickname: { type: 'string', description: '昵称', example: '系统管理员' },
            avatar: { type: 'string', description: '头像URL', example: 'https://via.placeholder.com/100' },
            email: { type: 'string', description: '邮箱', example: 'admin@example.com' },
            phone: { type: 'string', description: '手机号', example: '13800000001' },
            role: { type: 'string', description: '角色', enum: ['admin', 'editor', 'viewer'] },
            status: { type: 'integer', description: '状态 (1=启用, 0=禁用)', example: 1 },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', description: '用户名', example: 'admin' },
            password: { type: 'string', description: '密码', example: 'admin123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT Token' },
            user: { $ref: '#/components/schemas/UserInfo' },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            nickname: { type: 'string', description: '昵称', example: '张三丰' },
            email: { type: 'string', description: '邮箱', example: 'newemail@example.com' },
            phone: { type: 'string', description: '手机号', example: '13800000001' },
            role: { type: 'string', description: '角色', enum: ['admin', 'editor', 'viewer'] },
            status: { type: 'integer', description: '状态 (1=启用, 0=禁用)', example: 1 },
          },
        },
        PaginationData: {
          type: 'object',
          properties: {
            list: { type: 'array', items: { $ref: '#/components/schemas/UserInfo' } },
            total: { type: 'integer', description: '总记录数', example: 5 },
            page: { type: 'integer', description: '当前页码', example: 1 },
            pageSize: { type: 'integer', description: '每页数量', example: 10 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 400 },
            message: { type: 'string', example: '请求参数错误' },
            data: { type: 'object', nullable: true, example: null },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['系统'],
          summary: '健康检查',
          description: '检查服务是否正常运行',
          responses: {
            200: {
              description: '服务正常',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      code: { type: 'integer', example: 200 },
                      message: { type: 'string', example: 'ok' },
                      timestamp: { type: 'integer', example: 1755187200000 },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ==================== M01 认证模块 ====================
      '/api/v1/auth/login': {
        post: {
          tags: ['认证 (M01)'],
          summary: '用户登录',
          description: '使用用户名和密码登录，成功后返回 JWT Token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
                example: { username: 'admin', password: 'admin123' },
              },
            },
          },
          responses: {
            200: {
              description: '登录成功',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/LoginResponse' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: { description: '用户名和密码不能为空', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: '用户名或密码错误', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: '账号已被禁用', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

      '/api/v1/auth/me': {
        get: {
          tags: ['认证 (M01)'],
          summary: '获取当前用户信息',
          description: '返回当前登录用户的详细信息',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: '获取成功',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/UserInfo' } } },
                    ],
                  },
                },
              },
            },
            401: { description: '未登录或 Token 无效', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: '用户不存在', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

      // ==================== M02 用户管理模块 ====================
      '/api/v1/users': {
        get: {
          tags: ['用户管理 (M02)'],
          summary: '获取用户列表',
          description: '分页获取用户列表，支持关键词搜索和角色筛选',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: '页码' },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 }, description: '每页数量' },
            { name: 'keyword', in: 'query', schema: { type: 'string' }, description: '搜索关键词（用户名/昵称/邮箱）' },
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'editor', 'viewer'] }, description: '角色筛选' },
          ],
          responses: {
            200: {
              description: '获取成功',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/PaginationData' } } },
                    ],
                  },
                },
              },
            },
            401: { description: '未登录或 Token 无效' },
          },
        },
      },

      '/api/v1/users/{id}': {
        get: {
          tags: ['用户管理 (M02)'],
          summary: '获取用户详情',
          description: '获取指定用户的详细信息',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: '用户ID', example: 1 },
          ],
          responses: {
            200: {
              description: '获取成功',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/UserInfo' } } },
                    ],
                  },
                },
              },
            },
            401: { description: '未登录或 Token 无效' },
            404: { description: '用户不存在' },
          },
        },
        put: {
          tags: ['用户管理 (M02)'],
          summary: '更新用户信息',
          description: '更新指定用户的基本信息',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: '用户ID', example: 2 },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateUserRequest' },
                example: { nickname: '张三丰', email: 'zhangsanfeng@example.com', role: 'admin' },
              },
            },
          },
          responses: {
            200: {
              description: '更新成功',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/UserInfo' } } },
                    ],
                  },
                },
              },
            },
            401: { description: '未登录或 Token 无效' },
            404: { description: '用户不存在' },
          },
        },
        delete: {
          tags: ['用户管理 (M02)'],
          summary: '删除用户',
          description: '软删除用户（标记 status=0）',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: '用户ID', example: 3 },
          ],
          responses: {
            200: {
              description: '删除成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      code: { type: 'integer', example: 200 },
                      message: { type: 'string', example: '用户删除成功' },
                      data: { type: 'object', nullable: true, example: null },
                    },
                  },
                },
              },
            },
            401: { description: '未登录或 Token 无效' },
            404: { description: '用户不存在' },
          },
        },
      },
    },
    tags: [
      { name: '系统', description: '系统健康检查等基础接口' },
      { name: '认证 (M01)', description: '用户登录、Token 认证相关接口' },
      { name: '用户管理 (M02)', description: '用户增删改查管理接口 - 均需认证' },
    ],
  },
  apis: [], // 使用集中式定义，不从注释生成
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;