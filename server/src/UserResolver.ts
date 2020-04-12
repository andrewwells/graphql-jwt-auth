import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  Query,
  ObjectType,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import bcrypt from "bcryptjs";
import { User } from "./entity/User";
import { AppContext } from "./AppContext";
import { createRefreshToken, createAccessToken } from "./auth";
import { isAuthenticated } from "./isAuthenticated";
import { sendRefreshToken } from "./sendRefreshToken";
// import { getConnection } from "typeorm";

// This is how you can revoke all tokens for a user.
// Not currently exposing for security reasons

// const revokeRefreshTokens = async (userId: number) => {
//   await getConnection()
//     .getRepository(User)
//     .increment({ id: userId }, "tokenVersion", 1);
// };

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class LoginResult {
  @Field()
  accessToken: string;
}

@Resolver(User)
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("input") { email, password }: RegisterInput
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email,
      password: hashedPassword,
    }).save();
    return user;
  }

  @Mutation(() => LoginResult)
  async login(
    @Arg("input") { email, password }: LoginInput,
    @Ctx() ctx: AppContext
  ): Promise<LoginResult> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw Error("user not found");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw Error("invalid credentials");
    }

    // Set refresh token in cookie.
    sendRefreshToken(ctx.res, createRefreshToken(user.id, user.tokenVersion));

    // Return access token directly
    return {
      accessToken: createAccessToken(user.id),
    };
  }

  @Query(() => [User])
  @UseMiddleware([isAuthenticated])
  users(): Promise<User[]> {
    return User.find();
  }

  @Query(() => User)
  @UseMiddleware([isAuthenticated])
  me(@Ctx() ctx: AppContext) {
    return User.findOne(ctx.userId);
  }

  @Mutation(() => Boolean)
  logout(@Ctx() ctx: AppContext): Boolean {
    //sendRefreshToken(ctx.res, "");
    ctx.res.clearCookie("sid");
    return true;
  }
}
