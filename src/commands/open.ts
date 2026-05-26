import chalk from 'chalk'
import inquirer from 'inquirer'
import { Platform } from '../utils/platform'
import { runCmdSync } from '../utils/run'

interface AppItem {
  name: string
  cmd: string
  description: string
  aliases: string[]
  win?: boolean
  mac?: boolean
}

const appList: AppItem[] = [
  // ========== 极高频（每天/每周都用）==========
  {
    name: 'Chrome 浏览器',
    cmd: 'chrome',
    description: 'Google Chrome',
    aliases: ['chrome', 'ch', 'guge', 'guge liulanqi', 'gg', 'ggllq', 'liulanqi', 'liulan'],
    win: true,
    mac: true,
  },
  {
    name: 'Edge 浏览器',
    cmd: 'msedge',
    description: 'Microsoft Edge',
    aliases: ['edge', 'msedge', 'weiruan', 'weiruan liulanqi', 'wr', 'wrllq'],
    win: true,
    mac: true,
  },
  {
    name: 'VS Code',
    cmd: 'code',
    description: 'Visual Studio Code',
    aliases: ['code', 'vs', 'vscode', 'visual', 'studio', 'visualstudio', 'biancheng', 'bc', 'biancheng gongju', 'daima', 'dm', 'daima bianjiqi'],
    win: true,
    mac: true,
  },
  {
    name: '资源管理器',
    cmd: 'explorer',
    description: '文件资源管理器',
    aliases: ['explorer', 'zy', 'ziyuan', 'ziyuanguanliqi', 'zyg', 'wenjian', 'wj', 'wenjian guanli', 'wjgl', 'wenjianjia', 'wjg', 'wenjian guanliqi'],
    win: true,
  },
  {
    name: '任务管理器',
    cmd: 'taskmgr',
    description: '进程和性能监控',
    aliases: ['taskmgr', 'rw', 'renwu', 'renwuguanliqi', 'rwg', 'renwu guanli', 'jincheng', 'jc', 'xingneng', 'xn', 'jiankong', 'jk'],
    win: true,
  },
  {
    name: '记事本',
    cmd: 'notepad',
    description: '文本编辑器',
    aliases: ['notepad', 'bj', 'biji', 'bijiben', 'bjb', 'wenben', 'wb', 'bianjiqi', 'wenben bianji'],
    win: true,
    mac: true,
  },
  {
    name: 'Windows 终端',
    cmd: 'wt',
    description: 'Windows Terminal',
    aliases: ['wt', 'terminal', 'zd', 'zhongduan', 'windows terminal', 'win terminal', 'minglinghang', 'mlh', 'zhongduan jiemian', 'zdjm'],
    win: true,
  },
  {
    name: 'PowerShell',
    cmd: 'powershell',
    description: 'Windows PowerShell',
    aliases: ['powershell', 'ps', 'pwsh', 'shell', 'weiruan shell', 'wrshell'],
    win: true,
  },
  {
    name: '命令提示符',
    cmd: 'cmd',
    description: 'CMD',
    aliases: ['cmd', 'ml', 'mingling', 'minglingtishifu', 'mlt', 'mingling tishi', 'tishifu', 'tsf', 'zhiling', 'zl'],
    win: true,
  },
  {
    name: '计算器',
    cmd: 'calc',
    description: '计算器',
    aliases: ['calc', 'jsq', 'jisuanqi', 'jisuan', 'js', 'jisuan qi'],
    win: true,
  },

  // ========== 高频（每周/每月）==========
  {
    name: '网络连接',
    cmd: 'ncpa.cpl',
    description: '网络适配器设置',
    aliases: ['ncpa', 'wl', 'wangluo', 'wangluolianjie', 'lj', 'lianjie', 'lianjie wangluo', 'wangluo lianjie', 'wl lj', 'shipeiqi', 'spq'],
    win: true,
  },
  {
    name: '控制面板',
    cmd: 'control',
    description: 'Windows 控制面板',
    aliases: ['control', 'kz', 'kongzhi', 'kongzhi mianban', 'kzmb', 'kongzhimianban', 'mianban', 'mb'],
    win: true,
  },
  {
    name: '系统属性',
    cmd: 'sysdm.cpl',
    description: '高级系统设置',
    aliases: ['sysdm', 'xt', 'xitong', 'xitongshuxing', 'xts', 'shuxing', 'sx', 'gaoji', 'gj', 'xitong shuxing'],
    win: true,
  },
  {
    name: '环境变量',
    cmd: 'rundll32 sysdm.cpl,EditEnvironmentVariables',
    description: '编辑系统环境变量',
    aliases: ['env', 'hj', 'huanjing', 'huanjingbianliang', 'hjb', 'huanjing bianliang', 'bianliang', 'bl', 'xitong huanjing', 'xthj'],
    win: true,
  },
  {
    name: '设备管理器',
    cmd: 'devmgmt.msc',
    description: '硬件设备管理',
    aliases: ['devmgmt', 'sb', 'shebei', 'shebeiguanliqi', 'sbg', 'shebei guanli', 'guanliqi', 'glq', 'gl', 'yingjian', 'yj'],
    win: true,
  },
  {
    name: '注册表编辑器',
    cmd: 'regedit',
    description: 'Windows 注册表',
    aliases: ['regedit', 'zc', 'zhuce', 'zhucebiao', 'zcb', 'zhuce biao', 'bianjiqi', 'bjq', 'bianji', 'bj'],
    win: true,
  },
  {
    name: '远程桌面',
    cmd: 'mstsc',
    description: '远程桌面连接',
    aliases: ['mstsc', 'yc', 'yuancheng', 'yuanchengzhuomian', 'yczm', 'yuancheng zhuomian', 'zhuomian', 'zm', 'liangtai', 'lt'],
    win: true,
  },
  {
    name: '截图工具',
    cmd: 'SnippingTool',
    description: '屏幕截图',
    aliases: ['snippingtool', 'jt', 'jietu', 'jietu gongju', 'pingmu', 'pm', 'pingmu jietu', 'quping', 'qp'],
    win: true,
  },
  {
    name: '画图',
    cmd: 'mspaint',
    description: '画图工具',
    aliases: ['mspaint', 'ht', 'huatu', 'huatu gongju', 'huatugongju', 'tuxing', 'tx', 'tupian', 'tp'],
    win: true,
  },

  // ========== 中频（每月/需要时）==========
  {
    name: '程序和功能',
    cmd: 'appwiz.cpl',
    description: '卸载或更改程序',
    aliases: ['appwiz', 'cx', 'chengxu', 'chengxu he gongneng', 'chengxuhegongneng', 'gongneng', 'gn', 'xiezai', 'xz', 'chengxu gongneng'],
    win: true,
  },
  {
    name: '服务',
    cmd: 'services.msc',
    description: '系统服务管理',
    aliases: ['services', 'fw', 'fuwu', 'fuwuguanli', 'fwgl', 'fuwu guanli', 'fuwu guanliqi', 'fwg', 'xitong fuwu', 'xtfw'],
    win: true,
  },
  {
    name: '磁盘清理',
    cmd: 'cleanmgr',
    description: '磁盘清理工具',
    aliases: ['cleanmgr', 'cq', 'ciqing', 'ciqingqingli', 'cqq', 'ciqing qingli', 'qingli', 'ql', 'cipan', 'cp', 'cipan qingli'],
    win: true,
  },
  {
    name: '计算机管理',
    cmd: 'compmgmt.msc',
    description: '系统管理工具集',
    aliases: ['compmgmt', 'jsj', 'jisuanji', 'jisuanjiguanli', 'jsjgl', 'jisuanji guanli', 'xitong guanli', 'xtgl'],
    win: true,
  },
  {
    name: '磁盘管理',
    cmd: 'diskmgmt.msc',
    description: '硬盘分区管理',
    aliases: ['diskmgmt', 'cpgl', 'cipan guanli', 'yingpan', 'yp', 'yingpan guanli', 'fenqu', 'fq', 'cipan fenqu'],
    win: true,
  },
  {
    name: '任务计划程序',
    cmd: 'taskschd.msc',
    description: '定时任务管理',
    aliases: ['taskschd', 'rwh', 'renwu jihua', 'renwujihua', 'rwp', 'renwu plan', 'dingshi', 'ds', 'dingshi renwu'],
    win: true,
  },

  // ========== 系统设置类 ==========
  {
    name: '显示设置',
    cmd: 'ms-settings:display',
    description: '屏幕分辨率/亮度',
    aliases: ['display', 'xs', 'xianshi', 'xianshi shezhi', 'xianshishedang', 'pingmu', 'pm', 'fenbianlv', 'fbl', 'liangdu', 'ld'],
    win: true,
  },
  {
    name: '声音设置',
    cmd: 'ms-settings:sound',
    description: '音频输出/输入',
    aliases: ['sound', 'sy', 'shengyin', 'shengyin shezhi', 'shengyinshezhi', 'yinpin', 'yp', 'yinxiang', 'yx', 'maikefeng', 'mkf'],
    win: true,
  },
  {
    name: '电源选项',
    cmd: 'powercfg.cpl',
    description: '睡眠/休眠/关机设置',
    aliases: ['powercfg', 'dy', 'dianyuan', 'dianyuan xuanxiang', 'dyx', 'dianyuanxuanxiang', 'shuimian', 'sm', 'xiemian', 'xm', 'dianchi', 'dc'],
    win: true,
  },
  {
    name: '鼠标属性',
    cmd: 'main.cpl',
    description: '鼠标速度/指针',
    aliases: ['mouse', 'sb', 'shubiao', 'shubiao shuxing', 'shubiaoshuxing', 'zhizhen', 'zz', 'youjian', 'yj'],
    win: true,
  },
  {
    name: '日期和时间',
    cmd: 'timedate.cpl',
    description: '时区/时间同步',
    aliases: ['timedate', 'rq', 'riqi', 'riqi he shijian', 'rqhsj', 'riqishijian', 'shijian', 'sj', 'shiqu', 'sq', 'tongbu', 'tb'],
    win: true,
  },
  {
    name: '区域和语言',
    cmd: 'intl.cpl',
    description: '输入法/区域格式',
    aliases: ['intl', 'qy', 'quyu', 'quyu he yuyan', 'qyhyy', 'quyuyuyan', 'yuyan', 'yy', 'shurufa', 'srf', 'pinyin', 'py', 'wubi', 'wb'],
    win: true,
  },
  {
    name: '防火墙',
    cmd: 'firewall.cpl',
    description: 'Windows 防火墙',
    aliases: ['firewall', 'fhq', 'fanghuoqiang', 'wangluo anquan', 'wlaq', 'anquan fanghu', 'aqfh'],
    win: true,
  },
  {
    name: '字体',
    cmd: 'explorer shell:Fonts',
    description: '系统字体管理',
    aliases: ['fonts', 'zt', 'ziti', 'ziti guanli', 'ztgl', 'zitiguanli'],
    win: true,
  },
  {
    name: '打印机',
    cmd: 'control printers',
    description: '打印机和扫描仪',
    aliases: ['printer', 'dyj', 'dayinji', 'dayinji he saomiaoyi', 'dayinjisaomiaoyi', 'saomiaoyi', 'smy', 'dayin', 'dy'],
    win: true,
  },
  {
    name: '网络共享中心',
    cmd: 'control /name Microsoft.NetworkAndSharingCenter',
    description: '网络发现和共享',
    aliases: ['network', 'wl', 'wangluo gongxiang', 'wlgx', 'wangluogongxiang', 'gongxiang zhongxin', 'gxzx', 'wifi', 'wlan'],
    win: true,
  },
  {
    name: 'Windows 更新',
    cmd: 'ms-settings:windowsupdate',
    description: '系统更新设置',
    aliases: ['update', 'gx', 'gengxin', 'windows gengxin', 'windowsgengxin', 'xitong gengxin', 'xtgx', 'banben', 'bb'],
    win: true,
  },
  {
    name: '存储设置',
    cmd: 'ms-settings:storagesense',
    description: '磁盘空间管理',
    aliases: ['storage', 'cc', 'cunchu', 'cunchu shezhi', 'cunchushezhi', 'cipan kongjian', 'cpkj', 'kongjian', 'kj', 'qingli', 'ql'],
    win: true,
  },

  // ========== 低频/诊断 ==========
  {
    name: '事件查看器',
    cmd: 'eventvwr',
    description: '系统日志',
    aliases: ['eventvwr', 'sj', 'shijian', 'shijianchakanqi', 'sjc', 'shijian chakan', 'chakanqi', 'ckq', 'xitong rizhi', 'xtrz', 'rizhi', 'rz'],
    win: true,
  },
  {
    name: '性能监视器',
    cmd: 'perfmon',
    description: '性能监控',
    aliases: ['perfmon', 'xn', 'xingneng', 'xingnengjianshiqi', 'xnj', 'xingneng jianshi', 'jianshiqi', 'jsq', 'jianshi', 'js', 'jiankong', 'jk'],
    win: true,
  },
  {
    name: '本地安全策略',
    cmd: 'secpol.msc',
    description: '安全设置',
    aliases: ['secpol', 'aq', 'anquan', 'anquancelue', 'aqcl', 'anquan celue', 'celue', 'cl', 'bendian anquan', 'bdaq', 'anquan shezhi', 'aqsz'],
    win: true,
  },
  {
    name: '本地用户和组',
    cmd: 'lusrmgr.msc',
    description: '用户管理',
    aliases: ['lusrmgr', 'yh', 'yonghu', 'yonghuguanli', 'yhg', 'yonghu guanli', 'yonghu he zu', 'yhhz', 'zu', 'zuhu', 'bendian yonghu', 'bdyh'],
    win: true,
  },
  {
    name: '组策略编辑器',
    cmd: 'gpedit.msc',
    description: '本地组策略',
    aliases: ['gpedit', 'zl', 'zulue', 'zulue bianjiqi', 'zlbjq', 'zuluebianjiqi', 'zhengce', 'zc', 'bendian zulue', 'bdzl'],
    win: true,
  },
  {
    name: 'DirectX 诊断',
    cmd: 'dxdiag',
    description: '显卡/多媒体诊断',
    aliases: ['dxdiag', 'dx', 'directx', 'xianka', 'xk', 'xianshi', 'xs', 'yinxia', 'yx', 'duomeiti', 'dmt', 'zhenguan', 'zg'],
    win: true,
  },
  {
    name: '系统信息',
    cmd: 'msinfo32',
    description: '硬件和系统详情',
    aliases: ['msinfo', 'xx', 'xinxi', 'xitong xinxi', 'xtxx', 'xitongxinxi', 'yingjian xinxi', 'yjxx', 'peizhi', 'pz', 'cpu', 'neicun', 'nc'],
    win: true,
  },
  {
    name: '证书管理器',
    cmd: 'certmgr.msc',
    description: '数字证书管理',
    aliases: ['certmgr', 'zs', 'zhengshu', 'zhengshu guanli', 'zhengshuguanli', 'zhengshu guanliqi', 'zsgl', 'shuzi zhengshu', 'szzs'],
    win: true,
  },

  // ========== 辅助工具 ==========
  {
    name: '放大镜',
    cmd: 'magnify',
    description: '屏幕放大工具',
    aliases: ['magnify', 'fdj', 'fangdajing', 'fangda', 'fd', 'pingmu fangda', 'pmfd'],
    win: true,
  },
  {
    name: '屏幕键盘',
    cmd: 'osk',
    description: '虚拟键盘',
    aliases: ['osk', 'pmjp', 'pingmu jianpan', 'pingmujianpan', 'xuni jianpan', 'xnjp', 'ruanjianpan', 'rjp', 'jianpan', 'jp'],
    win: true,
  },
  {
    name: '便笺',
    cmd: 'stikynot',
    description: '桌面便签',
    aliases: ['stikynot', 'bj', 'bianjian', 'bianqian', 'bq', 'tiaozhi', 'tz', 'zhuomian bianqian', 'zmbq', 'jiyi', 'jy'],
    win: true,
  },
  {
    name: '写字板',
    cmd: 'write',
    description: '富文本编辑器',
    aliases: ['write', 'xzb', 'xieziban', 'xiezi', 'xz', 'fuwenben', 'fwb', 'wenben bianji', 'wbbj'],
    win: true,
  },
  {
    name: '字符映射表',
    cmd: 'charmap',
    description: '特殊字符输入',
    aliases: ['charmap', 'zf', 'zifu', 'zifu yingshe', 'zfys', 'zifuyingshe', 'teshu zifu', 'tszf', 'fuhao', 'fh', 'biaodian', 'bd'],
    win: true,
  },
  {
    name: '步骤记录器',
    cmd: 'psr',
    description: '操作步骤录制',
    aliases: ['psr', 'bz', 'buzhou', 'buzhou jilu', 'buzhoujilu', 'buzhou jiluqi', 'bzj', 'caozuo', 'cz', 'luzhi', 'lz', 'jietu luzhi'],
    win: true,
  },
]

function getFilteredList(): AppItem[] {
  if (Platform.isWin) return appList.filter(i => i.win !== false)
  if (Platform.isMac) return appList.filter(i => i.mac !== false)
  return appList
}

function openApp(item: AppItem) {
  if (Platform.isWin) {
    // URI 协议（如 ms-settings:xxx）不能用引号包裹
    const isUri = /^[a-z][a-z0-9+.-]*:/i.test(item.cmd) && !/^[a-z]:\\/i.test(item.cmd)
    const cmd = isUri ? `start ${item.cmd}` : `start "" "${item.cmd}"`
    runCmdSync(cmd, { shell: 'cmd.exe' })
  }
  else if (Platform.isMac) {
    runCmdSync(`open -a "${item.cmd}"`)
  }
  else {
    console.log(chalk.red('暂不支持该系统'))
  }
}

function searchApps(list: AppItem[], keyword: string): AppItem[] {
  const k = keyword.toLowerCase().trim()
  if (!k) return list

  return list.filter((item) => {
    const haystack = [
      item.name,
      item.description,
      item.cmd,
      ...item.aliases,
    ].map(s => s.toLowerCase())
    return haystack.some(s => s.includes(k))
  })
}

export async function openAppByKeyword(keyword?: string) {
  const list = getFilteredList()

  if (!keyword) {
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: '选择要打开的程序（支持键盘方向键/首字母快速定位）',
        choices: list.map(item => ({
          name: `${item.name} ${chalk.gray(`(${item.description})`)}`,
          value: item,
        })),
        pageSize: 15,
      },
    ])
    openApp(selected)
    return
  }

  const matches = searchApps(list, keyword)

  if (matches.length === 0) {
    console.log(chalk.red(`未找到匹配 "${keyword}" 的程序`))
    return
  }

  if (matches.length === 1) {
    console.log(chalk.green(`正在打开: ${matches[0].name}`))
    openApp(matches[0])
    return
  }

  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: `找到 ${matches.length} 个匹配项，请选择`,
      choices: matches.map(item => ({
        name: `${item.name} ${chalk.gray(`(${item.description})`)}`,
        value: item,
      })),
    },
  ])
  openApp(selected)
}
