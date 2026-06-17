# -*- coding: utf-8 -*-
"""
《随机身份》单场景 Demo —— 第 1 轮：公共演讲准备
运行：python demo.py
"""

import csv
import random
from datetime import datetime
from pathlib import Path

# ---------- 配置 ----------
REBEL_WORDS = {
    "拒绝", "不做", "凭什么", "为什么", "不",
    "拒绝任务", "可以不做吗", "不必", "不想", "谁规定的",
}

DATA_FILE = Path(__file__).parent / "play_log.csv"


def normalize(s):
    return s.strip().lower()


def is_rebel(text):
    t = normalize(text)
    if t in {w.lower() for w in REBEL_WORDS}:
        return True
    return t in REBEL_WORDS


def show_stats(time_v, prep, social):
    print()
    print("  ┌ 当前状态 ─────────────")
    print(f"  │ 时间余量    {bar(time_v)}  ({time_v:+d})")
    print(f"  │ 准备度      {bar(prep)}  ({prep:+d})")
    print(f"  │ 他人评价    {bar(social)}  ({social:+d})")
    print("  └────────────────────────")
    print()


def bar(value, width=8):
    """把 -3~+3 画成简单条"""
    value = max(-3, min(3, value))
    mid = width // 2
    if value == 0:
        return " " * mid + "│" + " " * (width - mid - 1)
    if value > 0:
        return " " * mid + "│" + "█" * value + " " * (width - mid - 1 - value)
    n = -value
    return " " * (mid - n) + "█" * n + "│" + " " * (width - mid - 1)


def prompt_choice():
    while True:
        raw = input("请输入 1 或 2（也可尝试输入其他文字）> ").strip()
        if raw in ("1", "2"):
            return raw, False
        if is_rebel(raw):
            return raw, True
        print("系统：请输入 1 或 2。")


def scene_public_speech(gender):
    """
    返回: choice, rebel, time, prep, social, notebook_line, feedback_lines
    """
    time_v, prep, social = 0, 0, 0
    feedback = []
    notebook = ""
    rebel = False
    choice = ""

    print()
    print("=" * 48)
    print("【系统 · 任务】")
    print("三天后有班级 / 部门公共演讲。请分配今晚 2 小时。")
    print()
    print("  1  花时间整理外表（化妆 / 修容 / 正装打理）")
    print("  2  不化妆，把时间用来改稿、排练")
    print("=" * 48)
    print()

    choice, rebel = prompt_choice()

    if rebel:
        print()
        print("系统：……")
        print()
        print("系统：本任务未要求你必须以「外表」证明你重视演讲。")
        print("      是否化妆 / 是否打理，与态度无必然关系。")
        print()
        print("旁白：没有人告诉你可以这样质疑任务里的预设。")
        print("      菜单上只有 1 和 2，但你可以说出菜单外的话。")
        print()
        prep += 2
        notebook = "你质疑了任务预设 → 按自己的方式准备，无额外议论"
        return choice, True, time_v, prep, social, notebook, feedback

    if choice == "1":
        if gender == "女":
            feedback.append("同事：「这样挺得体的，看起来重视这次演讲。」")
            feedback.append("旁白：你花 2 小时在外表上，稿只改了一小段。")
            prep += 1
            social += 1
            notebook = "选1 整理外表 → 得体，被肯定"
        else:
            feedback.append("同事：「嗯，可以。」")
            feedback.append("旁白：你花了一些时间打理，无人多评。")
            prep += 1
            notebook = "选1 整理外表 → 简短肯定，无额外压力"

    elif choice == "2":
        if gender == "女":
            feedback.append("同事（看你一眼）：「……你今天是不是有点随意？")
            feedback.append("              确定重视这次演讲吗？」")
            feedback.append("旁白：你多练了两遍，准备度上去了，但有人议论你的「态度」。")
            prep += 2
            social -= 2
            notebook = "选2 练稿 → 准备度↑，却被质疑「态度」"
        else:
            feedback.append("旁白：没人提起你的外表。你练完稿，准备度提升。")
            prep += 2
            notebook = "选2 练稿 → 准备度↑，无外表相关议论"

    return choice, rebel, time_v, prep, social, notebook, feedback


def ending(gender, choice, rebel, notebook, time_v, prep, social):
    print()
    print("=" * 48)
    print("【本局结束】")
    print("=" * 48)
    print()
    print("规律笔记本：")
    print(f"  · {notebook}")
    print()
    show_stats(time_v, prep, social)
    print("── 身份揭晓（本局随机，此前未告知）──")
    print(f"  你本轮的身份是：{gender}")
    print()
    if choice == "2" and gender == "女" and not rebel:
        print("── 对照提示 ──")
        print("  若本轮身份为「男」，同一选择（练稿、不额外打理）")
        print("  通常不会出现「是否重视演讲」的议论。")
    elif choice == "2" and gender == "男":
        print("── 对照提示 ──")
        print("  若本轮身份为「女」，同一选择可能引来")
        print("  「态度是否随便」的评价——而非能力问题。")
    print()

    if rebel:
        print("【结局 · 菜单外】")
        print("  你输入了系统没写在按钮上的话。")
        print("  偏见常以「规矩」「建议」出现；拒绝很少被写进选项。")
    else:
        print("【结局 · 习惯】")
        print("  你完成了系统给出的选项。")
        print("  完整版游戏中，第 4 轮起存在「建议」≠「必须」——")
        print("  游戏不会提示你可以输入：拒绝 / 凭什么 / 不做")
        print()
        print("  （本 Demo 在本场景也可尝试上述文字。）")

    print()
    print("想验证规律？再运行一次，或换选 1 / 2 对比反馈。")
    print()


def save_log(gender, choice, rebel, time_v, prep, social):
    row = {
        "time": datetime.now().isoformat(timespec="seconds"),
        "gender": gender,
        "choice": choice,
        "rebel": rebel,
        "time_stat": time_v,
        "prep": prep,
        "social": social,
    }
    new_file = not DATA_FILE.exists()
    with DATA_FILE.open("a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=row.keys())
        if new_file:
            w.writeheader()
        w.writerow(row)


def main():
    print()
    print("《随机身份》— 单场景 Demo")
    print("-" * 48)
    print("欢迎。你将收到一个日常任务。")
    print("请根据提示选择。本局身份随机，结束前不会告知。")
    print("-" * 48)

    gender = random.choice(["男", "女"])
    choice, rebel, time_v, prep, social, notebook, feedback = scene_public_speech(
        gender
    )

    for line in feedback:
        print(line)

    show_stats(time_v, prep, social)
    ending(gender, choice, rebel, notebook, time_v, prep, social)
    save_log(gender, choice, rebel, time_v, prep, social)
    print(f"（记录已追加到 {DATA_FILE.name}）")


if __name__ == "__main__":
    main()
