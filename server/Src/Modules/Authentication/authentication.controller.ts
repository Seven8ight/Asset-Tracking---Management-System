import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../Utilities/HttpFunctions.js";
import {
  authService,
  DepartmentService,
  logsServ,
  userServ,
} from "../../Data Objects/DTO.js";
import { REDIRECT_URL } from "../../Config/Env.js";
import {
  sendMemberInvitation,
  sendPasswordReset,
} from "../../Utilities/MailSender.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import { decode_access_token } from "../../Utilities/Jwt.js";
import type { PublicUser, User } from "../Users/user.types.js";
import { PermissionChecker } from "../../Middleware/PermissionChecker.js";

export const AuthenticationController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = authService;

  try {
    const requestPath = PathnameValidator(pathnames);

    if (
      requestPath == "register" ||
      requestPath == "login" ||
      requestPath == "refresh"
    ) {
      if (request.method != "POST")
        return sendResponseMessage(
          405,
          true,
          "Invalid HTTP Header method",
          response,
        );
    } else {
      if (request.method != "GET")
        return sendResponseMessage(
          405,
          true,
          "Invalid HTTP header method",
          response,
        );
    }

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
      case "me":
        const meuser = AuthValidator(request),
          publicUser = await userServ.getUser(meuser.userId);

        sendResponseMessage(200, false, publicUser, response);
        break;
      case "invite":
        const inviter = AuthValidator(request);

        await PermissionChecker(request, "users", "Invite users");

        if (inviter.departmentId == null || !inviter.departmentId)
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
          ) as PublicUser,
          department = await DepartmentService.getDepartment(
            inviter.departmentId,
          );

        await sendMemberInvitation(
          decodedUser as User,
          department.manager_name,
          department.name,
          `${REDIRECT_URL}/invite?token=${invitedUser.refreshToken}`,
        );

        await logsServ.createLog(inviter.departmentId, inviter.userId, {
          entity_id: decodedUser.id,
          entity_type: "User",
          action: `User Invitation`,
          old_values: {},
          new_values: {},
        });

        sendResponseMessage(200, false, invitedUser, response);
        break;
      case "passwordreset":
        const userRequesting = AuthValidator(request),
          findUser = await userServ.getUser(userRequesting.userId);

        await sendPasswordReset(findUser, `${REDIRECT_URL}/forgot-password`);

        await logsServ.createLog(
          userRequesting.departmentId,
          userRequesting.userId,
          {
            entity_id: userRequesting.userId,
            entity_type: "User",
            action: `Password reset`,
            old_values: {},
            new_values: {},
          },
        );

        sendResponseMessage(200, false, "Password reset email sent", response);
        break;
      default:
        sendResponseMessage(404, true, "Invalid api route", response);
        break;
    }
  } catch (error) {
    sendResponseMessage(400, true, (error as Error).message, response);
  }
};
