# Start both backend and frontend in separate terminals

Write-Host "Starting CineBook Application..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "  1. MongoDB Atlas URI in backend/.env" -ForegroundColor White
Write-Host "  2. Redis running (locally or Redis Cloud URL in backend/.env)" -ForegroundColor White
Write-Host "  3. TMDB API key in backend/.env" -ForegroundColor White
Write-Host "  4. Razorpay keys in backend/.env and frontend/.env" -ForegroundColor White
Write-Host ""

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'f:\Movie Booking Application\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'f:\Movie Booking Application\frontend'; npm run dev" -WindowStyle Normal

Write-Host "Both servers starting..." -ForegroundColor Green
Write-Host "  Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open the app in your browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "http://localhost:5173"
