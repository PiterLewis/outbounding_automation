FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeapp

COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodeapp:nodejs /app/index.js ./index.js

COPY --from=builder --chown=nodeapp:nodejs /app/src ./src 

USER nodeapp

EXPOSE 4000

ENV PORT=4000

CMD ["node", "index.js"]