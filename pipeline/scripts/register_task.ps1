# register_task.ps1
# Registra i task pianificati Windows per la newsletter apulia.ai.
#
# Esegui una volta come amministratore:
#   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
#   .\scripts\register_task.ps1
#
# Task creati:
#   ApuliaAI-Weekly  — ogni domenica alle 14:00 (invio alle 15:00 IT, pronta per lun mattina)
#   ApuliaAI-Monthly — primo del mese alle 06:00

$PythonExe  = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
$PipelineDir = $PSScriptRoot | Split-Path -Parent
$LogDir     = Join-Path $PipelineDir "output"

# ── WEEKLY ──────────────────────────────────────────────────

$WeeklyAction = New-ScheduledTaskAction `
  -Execute  "cmd.exe" `
  -Argument "/c `"$PythonExe`" `"$PipelineDir\run_weekly.py`" --publish --deliver >> `"$LogDir\scheduler_weekly.log`" 2>&1" `
  -WorkingDirectory $PipelineDir

$WeeklyTrigger = New-ScheduledTaskTrigger `
  -Weekly `
  -DaysOfWeek Sunday `
  -At "14:00"

$WeeklySettings = New-ScheduledTaskSettingsSet `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 45) `
  -RestartCount 2 `
  -RestartInterval (New-TimeSpan -Minutes 10) `
  -StartWhenAvailable

Register-ScheduledTask `
  -TaskName    "ApuliaAI-Weekly" `
  -Action      $WeeklyAction `
  -Trigger     $WeeklyTrigger `
  -Settings    $WeeklySettings `
  -Description "Genera e invia la newsletter settimanale AI Europa Weekly" `
  -RunLevel    Highest `
  -Force

Write-Host "[OK] Task 'ApuliaAI-Weekly' registrato — ogni domenica alle 14:00 (pronta per il lunedi mattina)"

# ── MONTHLY ─────────────────────────────────────────────────

$MonthlyAction = New-ScheduledTaskAction `
  -Execute  "cmd.exe" `
  -Argument "/c `"$PythonExe`" `"$PipelineDir\run_monthly.py`" --publish --deliver >> `"$LogDir\scheduler_monthly.log`" 2>&1" `
  -WorkingDirectory $PipelineDir

# Primo martedì del mese: usiamo un trigger mensile di Day 1 come approssimazione.
# Per il vero "primo martedì" è necessario un trigger custom; qui usiamo il giorno 1
# come default semplice. Modifica la data se preferisci.
$MonthlyTrigger = New-ScheduledTaskTrigger `
  -Monthly `
  -DaysOfMonth 1 `
  -At "06:00"

$MonthlySettings = New-ScheduledTaskSettingsSet `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 90) `
  -RestartCount 2 `
  -RestartInterval (New-TimeSpan -Minutes 15) `
  -StartWhenAvailable

Register-ScheduledTask `
  -TaskName    "ApuliaAI-Monthly" `
  -Action      $MonthlyAction `
  -Trigger     $MonthlyTrigger `
  -Settings    $MonthlySettings `
  -Description "Genera e invia il Briefing Strategico Mensile apulia.ai" `
  -RunLevel    Highest `
  -Force

Write-Host "[OK] Task 'ApuliaAI-Monthly' registrato — giorno 1 del mese alle 06:00"

Write-Host ""
Write-Host "Per eseguire manualmente:"
Write-Host "  Start-ScheduledTask -TaskName 'ApuliaAI-Weekly'"
Write-Host "  Start-ScheduledTask -TaskName 'ApuliaAI-Monthly'"
Write-Host ""
Write-Host "Per rimuovere:"
Write-Host "  Unregister-ScheduledTask -TaskName 'ApuliaAI-Weekly' -Confirm:`$false"
Write-Host "  Unregister-ScheduledTask -TaskName 'ApuliaAI-Monthly' -Confirm:`$false"
