export default function(ctx, closes) {
    // 清理节点
    ctx.clear = () => {
        closes.forEach(cb => cb());
        closes.splice(0, closes.length);
    };
    // 添加专用方法
    'success,error,info'.split(',').forEach(key => (ctx[key] = opt => ctx(key, opt)));
}
