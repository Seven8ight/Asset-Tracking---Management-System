import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../Utilities/HttpFunctions.js";
import { authService, logsServ, userServ } from "../../Data Objects/DTO.js";
import { REDIRECT_URL } from "../../Config/Env.js";
import { sendMemberInvitation } from "../../Utilities/MailSender.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import { decode_access_token } from "../../Utilities/Jwt.js";
import type { PublicUser } from "../Users/user.types.js";

// {
//   "username":"lorenzo",
//   "email":"llwmuchiri@gmail.com",
//   "password":"Davidwan1*"
// }

export const AuthenticationController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = authService;

  try {
    const requestPath = PathnameValidator(pathnames);

    if (request.method != "POST")
      return sendResponseMessage(
        405,
        true,
        "Invalid HTTP Header method",
        response,
      );

    switch (requestPath) {
      case "register":
        const registrationDetails: any = await getRequestBody(request),
          newUser = await service.register(registrationDetails);

        sendResponseMessage(201, false, newUser, response);
        break;
      case "login":
        const loginDetails: any = await getRequestBody(request),
          loggedUser = await service.login(loginDetails);

        sendResponseMessage(201, false, loggedUser, response);
        break;
      case "refresh":
        const refreshTokenDetails: any = await getRequestBody(request),
          newAccessToken = await service.refreshAuthToken(
            refreshTokenDetails.refresh_token,
          );

        sendResponseMessage(201, false, newAccessToken, response);
        break;
      case "invite":
        const user = AuthValidator(request);

        if (user.departmentId == null || !user.departmentId)
          return sendResponseMessage(
            400,
            true,
            "You should belong to a department first",
            response,
          );

        const userPostDetails: any = await getRequestBody(request),
          invitedUser = await authService.register(userPostDetails),
          decodedUser = decode_access_token(
            invitedUser.accessToken,
          ) as PublicUser;

        await sendMemberInvitation(
          userPostDetails,
          `${REDIRECT_URL}/invite?token=${invitedUser.refreshToken}`,
        );

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: decodedUser.id,
          entity_type: "User invititation",
          action: `User invite to department, ${user.departmentId}`,
          old_values: {},
          new_values: {},
        });

        sendResponseMessage(200, false, invitedUser, response);
        break;
      default:
        sendResponseMessage(404, true, "Invalid api route", response);
        break;
    }
  } catch (error) {
    sendResponseMessage(400, true, (error as Error).message, response);
  }
};
