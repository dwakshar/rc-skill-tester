import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { GreetCommand } from "../commands/GreetCommand";

describe("GreetCommand", () => {
    let command: GreetCommand;
    let context: SlashCommandContext;
    let read: IRead;
    let modify: IModify;
    let http: IHttp;
    let persis: IPersistence;
    let appUser: any;

    beforeEach(() => {
        command = new GreetCommand();

        const sender = {
            username: "testuser",
            name: "Test User",
            id: "sender-id",
        };

        const room = {
            id: "room-id",
        };

        appUser = {
            username: "appuser",
            id: "app-user-id",
        };

        context = {
            getSender: () => sender,
            getRoom: () => room,
            getArguments: () => [],
        } as any;

        read = {
            getUserReader: jest.fn().mockReturnValue({
                getAppUser: jest.fn().mockResolvedValue(appUser),
            }),
        } as any;

        const messageBuilder = {
            setSender: jest.fn().mockReturnThis(),
            setRoom: jest.fn().mockReturnThis(),
            setText: jest.fn().mockReturnThis(),
        };

        const creator = {
            startMessage: jest.fn().mockReturnValue(messageBuilder),
            finish: jest.fn(),
        };

        modify = {
            getCreator: jest.fn().mockReturnValue(creator),
        } as any;

        http = {} as IHttp;
        persis = {} as IPersistence;
    });

    it('should be named "greet"', () => {
        expect(command.command).toBe("greet");
    });

    it("should send a greeting message from the app user", async () => {
        const creator = modify.getCreator();
        const messageBuilder = creator.startMessage();

        await command.executor(context, read, modify, http, persis);

        expect(messageBuilder.setSender).toHaveBeenCalledWith(appUser);
        expect(messageBuilder.setText).toHaveBeenCalledWith("Hello!");
        expect(creator.finish).toHaveBeenCalledWith(messageBuilder);
    });

    it("should fallback to sender if app user is not available", async () => {
        // Mock getAppUser to return undefined
        read.getUserReader = jest.fn().mockReturnValue({
            getAppUser: jest.fn().mockResolvedValue(undefined),
        });

        const creator = modify.getCreator();
        const messageBuilder = creator.startMessage();
        const sender = context.getSender();

        await command.executor(context, read, modify, http, persis);

        expect(messageBuilder.setSender).toHaveBeenCalledWith(sender);
        expect(messageBuilder.setText).toHaveBeenCalledWith("Hello!");
        expect(creator.finish).toHaveBeenCalledWith(messageBuilder);
    });
});
