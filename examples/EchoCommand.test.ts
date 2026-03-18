import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { UserType } from "@rocket.chat/apps-engine/definition/users";
import { RocketChatAssociationModel, RocketChatAssociationRecord } from "@rocket.chat/apps-engine/definition/metadata";
import { EchoCommand } from "../commands/EchoCommand";

describe("EchoCommand", () => {
    let command: EchoCommand;
    let context: SlashCommandContext;
    let read: IRead;
    let modify: IModify;
    let http: IHttp;
    let persis: IPersistence;
    let persisRead: IPersistenceRead;
    let appUser: any;
    let sender: any;

    beforeEach(() => {
        command = new EchoCommand();

        sender = {
            username: "testuser",
            name: "Test User",
            id: "sender-id",
            type: UserType.USER,
        };

        const room = {
            id: "room-id",
        };

        appUser = {
            username: "appuser",
            id: "app-user-id",
        };

        context = {
            getSender: jest.fn().mockReturnValue(sender),
            getRoom: jest.fn().mockReturnValue(room),
            getArguments: jest.fn().mockReturnValue(["hello", "world"]),
        } as any;

        persisRead = {
            readByAssociation: jest.fn().mockResolvedValue([{ count: 1 }]),
        } as any;

        read = {
            getUserReader: jest.fn().mockReturnValue({
                getAppUser: jest.fn().mockResolvedValue(appUser),
            }),
            getPersistenceReader: jest.fn().mockReturnValue(persisRead),
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
        persis = {
            updateByAssociation: jest.fn().mockResolvedValue(undefined),
        } as any;
    });

    it('should be named "echo"', () => {
        expect(command.command).toBe("echo");
    });

    it("should echo the arguments with happy path", async () => {
        const creator = modify.getCreator();
        const messageBuilder = creator.startMessage();

        await command.executor(context, read, modify, http, persis);

        expect(messageBuilder.setText).toHaveBeenCalledWith("You said: hello world");
        expect(messageBuilder.setSender).toHaveBeenCalledWith(appUser);
        expect(creator.finish).toHaveBeenCalledWith(messageBuilder);
    });

    it("should ignore bot senders", async () => {
        sender.type = UserType.BOT;
        const creator = modify.getCreator();

        await command.executor(context, read, modify, http, persis);

        expect(creator.startMessage).not.toHaveBeenCalled();
    });

    it("should use sender if app user is not available", async () => {
        read.getUserReader = jest.fn().mockReturnValue({
            getAppUser: jest.fn().mockResolvedValue(undefined),
        });

        const creator = modify.getCreator();
        const messageBuilder = creator.startMessage();

        await command.executor(context, read, modify, http, persis);

        expect(messageBuilder.setSender).toHaveBeenCalledWith(sender);
        expect(messageBuilder.setText).toHaveBeenCalledWith("You said: hello world");
    });

    it("should store and update echo count in persistence", async () => {
        const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, sender.id);
        
        await command.executor(context, read, modify, http, persis);

        expect(read.getPersistenceReader().readByAssociation).toHaveBeenCalledWith(association);
        expect(persis.updateByAssociation).toHaveBeenCalledWith(association, { count: 2 }, true);
    });

    it("should initialize echo count if not present in persistence", async () => {
        persisRead.readByAssociation = jest.fn().mockResolvedValue([]);
        const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, sender.id);

        await command.executor(context, read, modify, http, persis);

        expect(persis.updateByAssociation).toHaveBeenCalledWith(association, { count: 1 }, true);
    });
});
