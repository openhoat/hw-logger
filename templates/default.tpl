<%
var colors, style, level;
colors = {
  ERROR: 'red',
  WARN:  'yellow',
  INFO:  'blue',
  DEBUG: 'green',
  TRACE: 'cyan'
};
style = (colors[data.level] || 'white').split('.').reduce(function (prev, cur) {
  return prev[cur];
}, chalk);
level = (data.level + new Array(config.levelsMaxLength + 1).join(' ')).slice(0, config.levelsMaxLength);
%><%= style.bold(level) %> - <%
if (data.caller) {
%><%= chalk.magenta(util.format('%s:%s', path.basename(data.caller.file, '.js'), data.caller.line)) %> - <%
} %><%= data.lastTime ? (function(duration) {
  return duration > 1000 ? Math.round(duration / 100) / 10 + 's' : duration + 'ms';
})(data.time.diff(data.lastTime)) : '0ms' %> - <%= util.format.apply(null, data.args) %>