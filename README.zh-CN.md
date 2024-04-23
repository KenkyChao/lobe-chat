<div align="center"><a name="readme-top"></a>


<h1>naiyun-chat</h1>

ChatGPT/LLMs 聊天应用与开发框架<br/>
支持语音合成、多模态、可扩展的插件系统<br/>


</details>


## 🛳 开箱即用


### `B` 使用 Docker 部署


我们提供了 Docker 镜像，供你在自己的私有设备上部署 NaiYunChat 服务。使用以下命令即可使用一键启动 NaiYunChat 服务：

```fish
docker run -d -p 10084:3210 \
  -e ACCESS_CODE=xxx \
  -e GROQ_API_KEY=xxx \
  --name lobe-chat \
  naiyun-chat:latest
```

>
> 如果你需要通过代理使用 OpenAI 服务，你可以使用 `OPENAI_PROXY_URL` 环境变量来配置代理地址：

```fish
  docker run -d -p 10084:3210 \
  -e OPENAI_API_KEY=sk-xxx \
  -e OPENAI_PROXY_URL=http://api.nwxsoft.com/v1 \
  -e ACCESS_CODE=naiyun \
  --name naiyun-chat \
  naiyun-chat:latest
 
```


<br/>

### 环境变量

本项目提供了一些额外的配置项，使用环境变量进行设置：

| 环境变量           | 类型 | 描述                                                                                                                          | 示例                                                                                                   |
| ------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `OPENAI_API_KEY`   | 必选 | 这是你在 OpenAI 账户页面申请的 API 密钥                                                                                       | `sk-xxxxxx...xxxxxx`                                                                                   |
| `OPENAI_PROXY_URL` | 可选 | 如果你手动配置了 OpenAI 接口代理，可以使用此配置项来覆盖默认的 OpenAI API 请求基础 URL                                        | `https://api.chatanywhere.cn` 或 `https://aihubmix.com/v1`<br/>默认值:<br/>`https://api.openai.com/v1` |
| `ACCESS_CODE`      | 可选 | 添加访问此服务的密码，你可以设置一个长密码以防被爆破，该值用逗号分隔时为密码数组                                              | `awCTe)re_r74` or `rtrt_ewee3@09!` or `code1,code2,code3`                                              |
| `CUSTOM_MODELS`    | 可选 | 用来控制模型列表，使用 `+` 增加一个模型，使用 `-` 来隐藏一个模型，使用 `模型名=展示名` 来自定义模型的展示名，用英文逗号隔开。 | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                  |

<br/>




## ⌨️ 本地开发

或者使用以下命令进行本地开发：

```fish
$ git clone http://192.168.1.155:3000/DevOps/naiyun-chat.git
$ cd lobe-chat
$ pnpm install
$ pnpm run dev
```
