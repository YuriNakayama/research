# Step 4: バイパス機構の撤去

## 目的

E2E が実 Cognito 経路に統一されたので、`x-e2e-bypass` 関連コードを本番コードから撤去する。
これがこの計画の**主目的**（保守負債・本番漏洩リスクの解消）。

## 4-1: `src/middleware.ts`

- `isE2EBypassAllowed` 関数を削除。
- `middleware()` 冒頭の `if (isE2EBypassAllowed(request)) return NextResponse.next();` を削除。
- ドキュメントコメントの「E2E bypass (intentional, server-only)」段落を削除。

変更後の `middleware()` は Cognito セッション検証のみを行う:

```typescript
export async function middleware(request: NextRequest) {
  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response: NextResponse.next() },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  return NextResponse.redirect(loginUrl);
}
```

冒頭のドキュメントコメントも、バイパス言及を除き
「毎リクエストが Cognito セッション検証を通る」旨に更新する。

## 4-2: `next.config.ts`

先頭の安全弁ブロック（`process.env.E2E_BYPASS_TOKEN` を参照する `if (...) throw`）を
**丸ごと削除**する。バイパストークンが存在しなくなるため安全弁自体が不要。

削除対象は 3〜16 行目（`// Safety valve:` コメントから `}` まで）。

## 完了条件

- [ ] `grep -rn "E2E_BYPASS\|e2e-bypass\|isE2EBypassAllowed\|ALLOW_E2E_BYPASS" frontend/src/` が 0 件
- [ ] `middleware.ts` は Cognito 検証のみ
- [ ] `next.config.ts` に安全弁ブロックが無い
