import {Context, Next} from '@apollosoftwarexyz/cinnamon';
import {Session} from '../models/Session';

export async function MaybeAuthorized(
    ctx: Context,
    next: Next
): Promise<any> {

    const token = ctx.headers['authorization'];
    await _checkAuthorization(ctx, token);
    return next();

}

export async function OnlyAuthorized(
    ctx: Context,
    next: Next
): Promise<any> {

    const token = ctx.headers['authorization'];

    if (await _checkAuthorization(ctx, token)) {
        return next();
    }

    return ctx.error(
        401,
        'ERR_UNAUTHORIZED',
        'You must be logged in to do that.'
    );

}

async function _checkAuthorization(ctx: Context, token?: string): Promise<boolean> {

    if (token && token.toLowerCase().startsWith('bearer ')) token = token.substring(7);

    const sessionRepo = ctx.getEntityManager()!.getRepository(Session);

    const session = await sessionRepo.findOne({ token }, {
        populate: ['user']
    });
    if (!session || !session.user) {
        return false;
    }

    ctx.session = session!;
    ctx.user = session!.user!;

    return true;

}

