import re
import glob
import os

def save_to_file(data, filename):
  with open(filename, 'w') as f:
    for d in data:
      f.write(f"{d}")

def extract_cpu_task_lines(filename):
  with open(filename, 'r') as f_in:
    modifiedLines = []

    for line in f_in:
      modifiedLine = line.strip().rstrip(',')
      if modifiedLine:
        modifiedLines.append(modifiedLine+"\n")

    save_to_file(modifiedLines, f"{filename}")

def process_csv_files(directory):
  for filename in glob.glob(os.path.join(directory, '*.csv')):
    extract_cpu_task_lines(filename)

directory = "./"
process_csv_files(directory)